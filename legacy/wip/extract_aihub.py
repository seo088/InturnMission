import tarfile
import json
import pandas as pd

# 1. 다운로드하신 .tar 파일의 정확한 경로와 이름 (★수정 필수★)
# 예: './공공데이터_CSV/aihub_data.tar'
tar_file_path = './download.tar'

sample_data = []
category_count = {
    '내과': 0, '외과': 0, '피부과': 0, '안과': 0, '치과': 0
}
target_num = 5 # 각 진료과별 5개씩 추출

print(f"📦 '{tar_file_path}' 파일 내부를 탐색합니다. (압축 해제 안 함!)")

# 2. tar 파일 열기 (읽기 모드)
try:
    with tarfile.open(tar_file_path, 'r:*') as tar:
        # tar 파일 안에 있는 파일들을 하나씩 훑어보기
        for member in tar.getmembers():
            
            # 목표치(5개씩)를 다 채웠으면 멈추기!
            if all(count >= target_num for count in category_count.values()):
                print("✨ 모든 카테고리 샘플링(5개씩) 완료!")
                break
                
            # 파일 확장자가 .json인 파일만 골라서 읽기
            if member.isfile() and member.name.endswith('.json'):
                f = tar.extractfile(member) # 파일 내용만 메모리로 임시 추출
                if f is not None:
                    try:
                        # JSON 내용을 파이썬으로 읽어오기
                        content = f.read().decode('utf-8')
                        data = json.loads(content)
                        
                        # =========================================================
                        # 🚨 [매우 중요] 실제 JSON 구조에 맞게 Key 이름을 수정해야 합니다!
                        # =========================================================
                        department = data.get('진료과', '')  # 수정 필요
                        question = data.get('질문', '')      # 수정 필요
                        answer = data.get('답변', '')        # 수정 필요

                        if department in category_count and category_count[department] < target_num:
                            sample_data.append({
                                '진료과': department,
                                '질문': question,
                                '답변': answer,
                                '원본파일': member.name
                            })
                            category_count[department] += 1
                            print(f"✅ {department} 데이터 추가됨 ({category_count[department]}/{target_num})")
                            
                    except json.JSONDecodeError:
                        continue # JSON 파일이 깨졌으면 무시하고 다음으로

    # 3. 뽑아낸 데이터를 CSV로 예쁘게 저장
    df = pd.DataFrame(sample_data)
    output_path = './aihub_sample_qa.csv'
    df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"\n🎉 성공! 알짜배기 샘플 데이터가 '{output_path}'에 저장되었습니다.")

except FileNotFoundError:
    print(f"❌ 파일을 찾을 수 없습니다. 경로를 다시 확인해 주세요: {tar_file_path}")