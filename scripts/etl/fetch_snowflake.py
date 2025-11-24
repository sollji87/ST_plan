"""
SNOWFLAKE에서 SERGIO TACCHINI 브랜드의 과거 데이터를 추출하는 ETL 스크립트

사용법:
1. .env 파일에 SNOWFLAKE 연결 정보 설정
2. python fetch_snowflake.py 실행
"""

import os
import pandas as pd
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 프로젝트 루트 경로
ROOT_DIR = Path(__file__).parent.parent.parent
RAW_DATA_DIR = ROOT_DIR / "public" / "data" / "raw"
PROCESSED_DATA_DIR = ROOT_DIR / "public" / "data" / "processed"

# 디렉토리 생성
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)


def connect_to_snowflake():
    """
    SNOWFLAKE에 연결
    
    환경 변수 필요:
    - SNOWFLAKE_ACCOUNT
    - SNOWFLAKE_USER
    - SNOWFLAKE_PASSWORD
    - SNOWFLAKE_WAREHOUSE
    - SNOWFLAKE_DATABASE
    - SNOWFLAKE_SCHEMA
    """
    try:
        import snowflake.connector
        
        conn = snowflake.connector.connect(
            account=os.getenv("SNOWFLAKE_ACCOUNT"),
            user=os.getenv("SNOWFLAKE_USER"),
            password=os.getenv("SNOWFLAKE_PASSWORD"),
            warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
            database=os.getenv("SNOWFLAKE_DATABASE"),
            schema=os.getenv("SNOWFLAKE_SCHEMA"),
        )
        return conn
    except ImportError:
        print("⚠️  snowflake-connector-python이 설치되지 않았습니다.")
        print("   pip install -r requirements.txt 를 실행하세요.")
        return None
    except Exception as e:
        print(f"❌ SNOWFLAKE 연결 실패: {e}")
        return None


def fetch_historical_sales(conn, brand="SERGIO TACCHINI"):
    """
    과거 매출 데이터 조회
    
    실제 쿼리는 SNOWFLAKE 스키마에 맞게 수정 필요
    """
    query = f"""
    SELECT 
        DATE_TRUNC('MONTH', SALE_DATE) AS PERIOD,
        SUM(SALE_AMOUNT) AS REVENUE,
        COUNT(DISTINCT ITEM_CODE) AS ITEM_COUNT
    FROM SALES_TABLE
    WHERE BRAND = '{brand}'
      AND SALE_DATE >= DATEADD(YEAR, -3, CURRENT_DATE())
    GROUP BY DATE_TRUNC('MONTH', SALE_DATE)
    ORDER BY PERIOD
    """
    
    try:
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print(f"⚠️  매출 데이터 조회 실패 (예시 쿼리): {e}")
        # 예시 데이터 생성
        return generate_sample_sales_data()


def fetch_historical_cost(conn, brand="SERGIO TACCHINI"):
    """
    과거 비용 데이터 조회
    """
    query = f"""
    SELECT 
        DATE_TRUNC('MONTH', COST_DATE) AS PERIOD,
        SUM(COST_AMOUNT) AS COST
    FROM COST_TABLE
    WHERE BRAND = '{brand}'
      AND COST_DATE >= DATEADD(YEAR, -3, CURRENT_DATE())
    GROUP BY DATE_TRUNC('MONTH', COST_DATE)
    ORDER BY PERIOD
    """
    
    try:
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print(f"⚠️  비용 데이터 조회 실패 (예시 쿼리): {e}")
        return generate_sample_cost_data()


def fetch_historical_inventory(conn, brand="SERGIO TACCHINI"):
    """
    과거 재고 데이터 조회
    """
    query = f"""
    SELECT 
        DATE_TRUNC('MONTH', INVENTORY_DATE) AS PERIOD,
        SUM(INVENTORY_AMOUNT) AS INVENTORY
    FROM INVENTORY_TABLE
    WHERE BRAND = '{brand}'
      AND INVENTORY_DATE >= DATEADD(YEAR, -3, CURRENT_DATE())
    GROUP BY DATE_TRUNC('MONTH', INVENTORY_DATE)
    ORDER BY PERIOD
    """
    
    try:
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print(f"⚠️  재고 데이터 조회 실패 (예시 쿼리): {e}")
        return generate_sample_inventory_data()


def generate_sample_sales_data():
    """예시 매출 데이터 생성 (테스트용)"""
    dates = pd.date_range(end=datetime.now(), periods=36, freq="M")
    return pd.DataFrame({
        "PERIOD": dates,
        "REVENUE": [1000000 + i * 50000 + (i % 12) * 20000 for i in range(36)],
        "ITEM_COUNT": [100 + i * 2 for i in range(36)],
    })


def generate_sample_cost_data():
    """예시 비용 데이터 생성 (테스트용)"""
    dates = pd.date_range(end=datetime.now(), periods=36, freq="M")
    return pd.DataFrame({
        "PERIOD": dates,
        "COST": [600000 + i * 30000 + (i % 12) * 10000 for i in range(36)],
    })


def generate_sample_inventory_data():
    """예시 재고 데이터 생성 (테스트용)"""
    dates = pd.date_range(end=datetime.now(), periods=36, freq="M")
    return pd.DataFrame({
        "PERIOD": dates,
        "INVENTORY": [500000 + i * 20000 + (i % 12) * 5000 for i in range(36)],
    })


def process_and_save_data(sales_df, cost_df, inventory_df):
    """
    데이터 정제 및 저장
    """
    # 데이터 병합
    merged_df = sales_df.merge(cost_df, on="PERIOD", how="outer")
    merged_df = merged_df.merge(inventory_df, on="PERIOD", how="outer")
    merged_df = merged_df.sort_values("PERIOD").fillna(0)
    
    # 수익성 계산
    merged_df["PROFIT"] = merged_df["REVENUE"] - merged_df["COST"]
    merged_df["PROFITABILITY"] = (merged_df["PROFIT"] / merged_df["REVENUE"] * 100).fillna(0)
    
    # 날짜 형식 변환
    merged_df["PERIOD"] = merged_df["PERIOD"].dt.strftime("%Y-%m")
    
    # JSON으로 저장 (프론트엔드에서 사용)
    output_file = PROCESSED_DATA_DIR / "historical_data.json"
    merged_df.to_json(output_file, orient="records", date_format="iso", indent=2)
    
    # CSV로도 저장
    csv_file = PROCESSED_DATA_DIR / "historical_data.csv"
    merged_df.to_csv(csv_file, index=False)
    
    print(f"✅ 데이터 저장 완료: {output_file}")
    print(f"✅ 데이터 저장 완료: {csv_file}")
    
    return merged_df


def main():
    """메인 실행 함수"""
    print("🚀 SNOWFLAKE 데이터 추출 시작...")
    
    # SNOWFLAKE 연결 시도
    conn = connect_to_snowflake()
    
    if conn:
        print("✅ SNOWFLAKE 연결 성공")
        sales_df = fetch_historical_sales(conn)
        cost_df = fetch_historical_cost(conn)
        inventory_df = fetch_historical_inventory(conn)
        conn.close()
    else:
        print("⚠️  SNOWFLAKE 연결 실패 - 예시 데이터 사용")
        sales_df = generate_sample_sales_data()
        cost_df = generate_sample_cost_data()
        inventory_df = generate_sample_inventory_data()
    
    # 원본 데이터 저장
    timestamp = datetime.now().strftime("%Y%m%d")
    sales_df.to_csv(RAW_DATA_DIR / f"sales_raw_{timestamp}.csv", index=False)
    cost_df.to_csv(RAW_DATA_DIR / f"cost_raw_{timestamp}.csv", index=False)
    inventory_df.to_csv(RAW_DATA_DIR / f"inventory_raw_{timestamp}.csv", index=False)
    
    # 데이터 정제 및 저장
    processed_df = process_and_save_data(sales_df, cost_df, inventory_df)
    
    print(f"\n📊 처리된 데이터 요약:")
    print(f"   - 기간: {processed_df['PERIOD'].min()} ~ {processed_df['PERIOD'].max()}")
    print(f"   - 총 레코드 수: {len(processed_df)}")
    print("✅ 완료!")


if __name__ == "__main__":
    main()

