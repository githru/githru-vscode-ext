// test-llm.ts
// test-llm.ts
import { config } from 'dotenv';
import { ask } from './llm';

// .env 경로 고정 로드
config({ path: __dirname + '/../../../.env' });
console.log('Loaded key from env:', process.env.OPENAI_API_KEY);

async function main() {
    const prompt = 'This is test of the project, How can I turn on this project? do you know githru? Please answer in one word.';
    const answer = await ask(prompt);
    console.log('respond:', answer);
}

main().catch(err => {
    console.error('error rise:', err);
});

// 환경변수 초기화
// unset OPENAI_API_KEY

//실행
//npx ts-node src/boot/yoongja/test-llm.ts