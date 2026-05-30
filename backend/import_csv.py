import pandas as pd
from sqlalchemy import create_engine
import os

DB_URL = "postgresql://postgres:spark!1@127.0.0.1:5435/petgraph_db"
engine = create_engine(DB_URL)

def import_rescue_data_fixed():
    file_path = "/home/hong/petgraph/csv_data/08_구조동물_조회데이터.csv"
    table_name = "08_구조동물_조회데이터"
    
    if not os.path.exists(file_path):
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        return

    print(f"🚀 [구조동물 데이터] 고밀도 주입 시작 (타입 오류 방지 적용)...")

    try:
        # 핵심 변경 사항: dtype=str 을 추가하여 모든 데이터를 문자열로 읽습니다.
        # 이렇게 하면 이미지 주소(URL) 컬럼이 숫자로 오인받는 일을 방지합니다.
        reader = pd.read_csv(file_path, encoding='utf-8', chunksize=500, 
                             on_bad_lines='skip', dtype=str)
        
        first_chunk = True
        total_rows = 0
        
        for i, chunk in enumerate(reader):
            if first_chunk:
                # 첫 번째 묶음으로 테이블을 생성할 때 모든 컬럼이 TEXT 형식이 됩니다.
                chunk.to_sql(name=table_name, con=engine, if_exists='replace', index=False)
                first_chunk = False
            else:
                chunk.to_sql(name=table_name, con=engine, if_exists='append', index=False)
            
            total_rows += len(chunk)
            if (i + 1) % 10 == 0:
                print(f"⏳ 현재 {total_rows}줄 주입 완료...")

        print(f"✅ 대성공! 총 {total_rows}개의 데이터가 TEXT 형식으로 안전하게 저장되었습니다.")

    except UnicodeDecodeError:
        print("❌ 인코딩 에러: cp949로 재시도합니다.")
        # 만약 cp949 파일이라면 위 read_csv의 encoding만 'cp949'로 바꿔서 실행하세요.
    except Exception as e:
        print(f"❌ 실패 원인: {e}")

if __name__ == "__main__":
    import_rescue_data_fixed()