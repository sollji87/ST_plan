# SERGIO TACCHINI 중장기 사업계획 네비게이터

SERGIO TACCHINI 브랜드의 중장기(3년) 사업계획을 시뮬레이션할 수 있는 웹앱입니다.

## 프로젝트 개요

현업 담당자가 직접 수치를 입력하여 3년간의 사업계획을 시뮬레이션하고, 결과를 대시보드로 확인할 수 있습니다.

### 주요 기능

1. **입력 인터페이스**
   - 수치 직접 입력 (매출, 비용, 재고)
   - 연간 성장률 설정
   - 시나리오 선택 (보수적/중립/공격적)

2. **시뮬레이션 엔진**
   - 3년간 월별 예측 계산
   - 성장률 및 시나리오 적용
   - 수익성 자동 계산

3. **대시보드**
   - KPI 카드 (매출, 비용, 이익, 수익성)
   - 시계열 차트 (매출/비용 추이)
   - 비교 테이블 (연도별 집계)

4. **데이터 연동**
   - SNOWFLAKE에서 과거 데이터 추출
   - Python ETL 스크립트로 데이터 정제

## 기술 스택

### 프론트엔드
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (차트 시각화)
- **shadcn/ui** (UI 컴포넌트)
- 시뮬레이션 계산은 프론트엔드에서 직접 수행

### 데이터/ETL
- **Python 3.x**
  - `pandas`
  - `snowflake-connector-python`
  - `python-dotenv`

## 프로젝트 구조

```
.
├─ README_SERGIO_TACCHINI.md
├─ package.json
├─ next.config.mjs
├─ public/
│  └─ data/
│     ├─ raw/                   # SNOWFLAKE 원본 데이터
│     └─ processed/             # 정제된 데이터
├─ scripts/
│  └─ etl/
│     ├─ requirements.txt
│     └─ fetch_snowflake.py    # SNOWFLAKE 데이터 추출
└─ src/
   ├─ app/
   │  ├─ page.tsx               # 메인 페이지
   │  └─ simulation/
   │     └─ page.tsx            # 시뮬레이션 페이지
   ├─ components/
   │  ├─ simulation/            # 입력 컴포넌트
   │  ├─ dashboard/              # 대시보드 컴포넌트
   │  └─ ui/                     # UI 컴포넌트
   └─ lib/
      ├─ api.ts                  # API 클라이언트
      └─ simulation.ts           # 시뮬레이션 유틸
```

## 설치 및 실행

### 1. 의존성 설치

```bash
# 프론트엔드 의존성
npm install

# Python ETL 의존성 (선택사항)
cd scripts/etl
pip install -r requirements.txt
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# .env.local 파일 생성
cp env.example .env.local
```

`.env.local` 파일에 다음 내용을 입력하세요:

```env
# Snowflake 연결 정보
SNOWFLAKE_ACCOUNT=your-account
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_WAREHOUSE=your-warehouse
SNOWFLAKE_DATABASE=your-database
SNOWFLAKE_SCHEMA=your-schema

# OpenAI API 키
OPENAI_API_KEY=your-openai-api-key
```

**중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다. 실제 값으로 변경하세요.

#### Python ETL (scripts/etl/.env)
```env
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=your_warehouse
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
```

### 3. SNOWFLAKE 데이터 추출 (선택사항)

```bash
cd scripts/etl
python fetch_snowflake.py
```

SNOWFLAKE 연결이 없어도 예시 데이터로 동작합니다.

### 3. 서버 실행

```bash
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

### 4. 브라우저에서 접속

`http://localhost:3000`에 접속하여 시뮬레이션을 시작하세요.

## 사용 방법

1. **시뮬레이션 입력**
   - 메인 페이지에서 "시뮬레이션 시작하기" 클릭
   - 매출, 비용, 재고의 기준값 입력
   - 각 지표별 성장률 설정 (선택)
   - 시나리오 선택 (보수적/중립/공격적)
   - 시뮬레이션 기간 선택 (1년/2년/3년/5년)

2. **결과 확인**
   - "시뮬레이션 실행" 버튼 클릭
   - KPI 카드에서 주요 지표 확인
   - 차트에서 추이 확인
   - 테이블에서 연도별 비교 확인

## 시뮬레이션 계산

시뮬레이션은 프론트엔드에서 직접 계산됩니다. `src/lib/api.ts`의 `runSimulation` 함수를 사용하여 계산합니다.

**입력 형식:**
```typescript
{
  revenue: {
    baseValue: 1000000000,
    growthRate: 10,
    scenario: "neutral"
  },
  cost: {
    baseValue: 600000000,
    growthRate: 5,
    scenario: "neutral"
  },
  inventory: {
    baseValue: 500000000,
    growthRate: 0,
    scenario: "neutral"
  },
  years: 3
}
```

**결과 형식:**
```typescript
{
  revenue: [
    { period: "2024-01", value: 1000000000 },
    ...
  ],
  cost: [...],
  inventory: [...],
  profit: [...],
  profitability: [...]
}
```

## Snowflake & OpenAI 사용

### Snowflake 연결

```typescript
import { connectToSnowflakeFromEnv, executeQuery } from '@/lib/snowflake';

// 환경 변수에서 자동으로 설정 가져오기
const conn = await connectToSnowflakeFromEnv();

// 쿼리 실행
const results = await executeQuery(conn, 'SELECT * FROM sales WHERE brand = \'SERGIO TACCHINI\'');

// 연결 종료
closeConnection(conn);
```

### OpenAI 사용

```typescript
import { getOpenAIClient, generateText } from '@/lib/openai';

// 환경 변수에서 자동으로 초기화
const response = await generateText('SERGIO TACCHINI 브랜드의 매출 트렌드를 분석해주세요.');

// 또는 직접 클라이언트 사용
const client = getOpenAIClient();
const completion = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: '질문 내용' }],
});
```

## 개발 가이드

### 컴포넌트 추가

새로운 컴포넌트는 `src/components/` 디렉토리에 추가하세요.

### 계산 로직 수정

시뮬레이션 계산 로직은 `src/lib/api.ts`와 `src/lib/simulation.ts`에서 수정할 수 있습니다.

### 스타일링

Tailwind CSS를 사용하여 스타일링하세요. shadcn/ui 컴포넌트를 활용할 수 있습니다.

## 배포

### Vercel 배포

1. GitHub에 리포지토리 푸시
2. Vercel에서 프로젝트 연결
3. 배포

프론트엔드에서 모든 계산을 수행하므로 별도의 백엔드 서버가 필요 없습니다.

## 라이선스

이 프로젝트는 내부 사용을 위한 것입니다.

