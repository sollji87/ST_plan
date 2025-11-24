// Snowflake 연결 유틸리티

import snowflake from 'snowflake-sdk';

export interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  warehouse: string;
  database: string;
  schema: string;
}

let connection: snowflake.Connection | null = null;

/**
 * 환경 변수에서 Snowflake 설정 가져오기
 */
export function getSnowflakeConfigFromEnv(): SnowflakeConfig {
  const account = process.env.SNOWFLAKE_ACCOUNT;
  const username = process.env.SNOWFLAKE_USERNAME;
  const password = process.env.SNOWFLAKE_PASSWORD;
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE;
  const database = process.env.SNOWFLAKE_DATABASE;
  const schema = process.env.SNOWFLAKE_SCHEMA;

  if (!account || !username || !password || !warehouse || !database || !schema) {
    throw new Error('Snowflake 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  }

  return {
    account,
    username,
    password,
    warehouse,
    database,
    schema,
  };
}

/**
 * Snowflake 연결 (환경 변수 사용)
 */
export async function connectToSnowflakeFromEnv(): Promise<snowflake.Connection> {
  const config = getSnowflakeConfigFromEnv();
  return connectToSnowflake(config);
}

/**
 * Snowflake 연결
 */
export async function connectToSnowflake(config: SnowflakeConfig): Promise<snowflake.Connection> {
  return new Promise((resolve, reject) => {
    const conn = snowflake.createConnection({
      account: config.account,
      username: config.username,
      password: config.password,
      warehouse: config.warehouse,
      database: config.database,
      schema: config.schema,
    });

    conn.connect((err, conn) => {
      if (err) {
        reject(err);
      } else {
        connection = conn;
        resolve(conn);
      }
    });
  });
}

/**
 * Snowflake 쿼리 실행
 */
export async function executeQuery(
  connection: snowflake.Connection,
  query: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      },
    });
  });
}

/**
 * Snowflake 연결 종료
 */
export function closeConnection(connection: snowflake.Connection): void {
  connection.destroy((err) => {
    if (err) {
      console.error('Snowflake 연결 종료 오류:', err);
    }
  });
}

