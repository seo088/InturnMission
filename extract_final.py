import os
import json
import pandas as pd
import zipfile
import glob

print("🚀 AI 허브 데이터 엑기스 추출을 시작합니다...")

# 1. 방금 압축을 풀었던 라벨링 데이터 폴더 경로
folder_path = '/home/hong/petgraph/59.반려견_성장_및_질병_관련_말뭉치_데이터/3.개방데이터/1.데이터/Validation/02.라벨링데이터'

sample_data = []
category_count = {'내과': 0, '외과': 0, '피부과': 0, '안과': 0, '치과': 0}
target_num = 5 # 각 진료과별 5개씩!

# 2. 폴더 안에 있는 .zip.part0 파일들 목록 싹 가져오기
zip_files = glob.glob(os.path.join(folder_path, '*.zip.part0'))

for zip_path in zip_files:
    try:
        # 압축 파일을 풀지 않고 파이썬으로 조용히 열어보기
        with zipfile.ZipFile(zip_path, 'r') as z:
            for file_info in z.infolist():
                
                # 5개씩 다 모았으면 바로 반복문 탈출! (초스피드)
                if all(count >= target_num for count in category_count.values()):
                    break 

                if file_info.filename.endswith('.json'):
                    with z.open(file_info) as f:
                        content = f.read().decode('utf-8')
                        data = json.loads(content)
                        
                        # 🚨 방금 알아낸 정확한 JSON 키(Key) 구조 적용!
                        department = data.get('meta', {}).get('department', '')
                        question = data.get('qa', {}).get('input', '')
                        answer = data.get('qa', {}).get('output', '')

                        if department in category_count and category_count[department] < target_num:
                            sample_data.append({
                                '진료과': department,
                                '질문': question,
                                '답변': answer,
                                '원본파일': file_info.filename
                            })
                            category_count[department] += 1
                            print(f"✅ {department} 수집 완료 ({category_count[department]}/{target_num})")
                            
    except Exception as e:
        print(f"⚠️ 파일 읽기 에러 ({os.path.basename(zip_path)}): {e}")

# 3. 드디어 CSV로 저장!
df = pd.DataFrame(sample_data)
output_csv = '/home/hong/petgraph/aihub_sample_qa.csv'
df.to_csv(output_csv, index=False, encoding='utf-8-sig')

print(f"\n🎉 대성공! 총 {len(df)}개의 알짜배기 데이터가 '{output_csv}'에 저장되었습니다!")