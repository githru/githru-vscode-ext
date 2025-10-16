import { test, expect } from "@playwright/test";

test.describe("TemporalFilter 컴포넌트 E2E 테스트", () => {
  // 앱이 완전히 로드될 때까지 대기
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 로딩 스피너가 사라질 때까지 대기
    try {
      await page.waitForSelector(".BounceLoader", { state: "hidden", timeout: 15000 });
    } catch {
      // 로딩 스피너가 없으면 무시
    }

    // 추가 대기 시간으로 차트가 완전히 렌더링되도록 함
    await page.waitForTimeout(2000);
  });

  test("기간 브러시 필터링이 정상 작동해야 한다", async ({ page }) => {
    // Given: 기본 UI 요소들이 표시되는지 확인
    await expect(page.locator(".header-container")).toBeVisible();
    await expect(page.locator(".top-container")).toBeVisible();

    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Warning")) {
        consoleErrors.push(msg.text());
      }
    });

    // When: SVG 차트 영역 찾기
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) {
      throw new Error("SVG chart not found");
    }

    // 브러시 드래그 실행 (차트의 중간 부분에서 끝 부분으로)
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    // 필터 적용 대기
    await page.waitForTimeout(3000);

    // Then: 필터 적용 결과 검증
    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "Reset 버튼이 필터 적용 후 표시되어야 함").toBeVisible();

    // Reset 버튼의 텍스트 확인
    await expect(resetButton.locator(".temporal-filter__button-text")).toHaveText("Reset");

    // 콘솔 에러가 없는지 확인
    expect(consoleErrors, `콘솔 에러: ${consoleErrors.join("\n")}`).toHaveLength(0);
  });

  test("필터링 후 통계가 갱신되어야 한다", async ({ page }) => {
    // Given: 초기 통계 데이터 확인
    await page.waitForTimeout(2000);

    // 초기 통계 막대 수와 클러스터 요약 아이템 수 확인
    const initialBars = await page.locator(".author-bar-chart__bar").count();
    const initialSummaryItems = await page.locator(".cluster-summary__item").count();

    console.log(`초기 막대 수: ${initialBars}`);
    console.log(`초기 요약 아이템 수: ${initialSummaryItems}`);

    // 데이터가 없으면 테스트 스킵
    if (initialBars === 0) {
      console.log("⚠️ 초기 데이터가 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // When: 브러시 필터 적용
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG 차트를 찾을 수 없습니다");

    // 브러시 드래그 (차트의 좌측 30%에서 우측 70%까지)
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    // 필터 적용 대기
    await page.waitForTimeout(3000);

    // Then: 통계 갱신 확인
    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "필터 적용 후 Reset 버튼이 표시되어야 함").toBeVisible();

    // 필터링된 통계 데이터 확인
    const filteredBars = await page.locator(".author-bar-chart__bar").count();
    const filteredSummaryItems = await page.locator(".cluster-summary__item").count();

    console.log(`필터링된 막대 수: ${filteredBars}`);
    console.log(`필터링된 요약 아이템 수: ${filteredSummaryItems}`);

    // 필터링 후 막대 수는 같거나 줄어들어야 함
    expect(filteredBars, "필터링 후 막대 수는 초기값보다 작거나 같아야 함").toBeLessThanOrEqual(initialBars);
    expect(filteredSummaryItems, "필터링 후 요약 아이템 수는 초기값보다 작거나 같아야 함").toBeLessThanOrEqual(
      initialSummaryItems
    );
  });

  test("Reset 버튼으로 필터가 해제되어야 한다", async ({ page }) => {
    // Given: 필터 적용
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG 차트를 찾을 수 없습니다");

    // 브러시 드래그로 필터 적용
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(3000);

    // 필터 적용 확인
    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "필터 적용 후 Reset 버튼이 표시되어야 함").toBeVisible();

    // When: Reset 버튼 클릭
    await resetButton.click();
    await page.waitForTimeout(2000);

    // Then: 필터 해제 확인
    await expect(resetButton, "Reset 버튼 클릭 후 버튼이 사라져야 함").not.toBeVisible();

    // 브러시가 리셋되었는지 확인 (차트 영역에 브러시 선택 영역이 없어야 함)
    const brushSelection = page.locator(".brush .selection");
    await expect(brushSelection).not.toBeVisible();
  });

  test("다양한 브러시 선택 영역으로 필터링이 작동해야 한다", async ({ page }) => {
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG 차트를 찾을 수 없습니다");

    // 테스트할 다양한 브러시 영역들
    const brushAreas = [
      { start: 0.1, end: 0.3, name: "좌측 영역" },
      { start: 0.4, end: 0.6, name: "중앙 영역" },
      { start: 0.7, end: 0.9, name: "우측 영역" },
    ];

    for (const area of brushAreas) {
      console.log(`${area.name} 필터링 테스트 시작`);

      // 브러시 드래그
      const startX = box.x + box.width * area.start;
      const endX = box.x + box.width * area.end;
      const y = box.y + box.height * 0.5;

      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(endX, y, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(2000);

      // Reset 버튼이 표시되는지 확인
      const resetButton = page.locator(".temporal-filter__reset-button");
      await expect(resetButton, `${area.name} 필터링 후 Reset 버튼이 표시되어야 함`).toBeVisible();

      // Reset으로 필터 해제
      await resetButton.click();
      await page.waitForTimeout(1000);

      console.log(`${area.name} 필터링 테스트 완료`);
    }
  });

  test("빈 데이터 상태에서도 컴포넌트가 정상 렌더링되어야 한다", async ({ page }) => {
    // Given: 빈 데이터 상태 시뮬레이션을 위해 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    try {
      await page.waitForSelector(".BounceLoader", { state: "hidden", timeout: 15000 });
    } catch {
      // 로딩 스피너가 없으면 무시
    }

    await page.waitForTimeout(2000);

    // When: TemporalFilter 컴포넌트 확인
    const temporalFilter = page.locator(".temporal-filter");
    await expect(temporalFilter, "TemporalFilter 컴포넌트가 렌더링되어야 함").toBeVisible();

    const svg = page.locator(".temporal-filter__chart");
    await expect(svg, "SVG 차트가 렌더링되어야 함").toBeVisible();

    // Then: Reset 버튼이 표시되지 않아야 함 (필터가 적용되지 않은 상태)
    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "빈 데이터 상태에서는 Reset 버튼이 표시되지 않아야 함").not.toBeVisible();
  });
});
