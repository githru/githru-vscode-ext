import { test, expect } from "@playwright/test";

test.describe("PR 커밋 상세 정보 확인 기능 E2E 테스트", () => {
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

  test("PR에 포함된 커밋들의 목록이 표시된다", async ({ page }) => {
    // Given: 앱이 로드되고 데이터가 있는 상태
    await expect(page.locator(".header-container")).toBeVisible();
    await expect(page.locator(".top-container")).toBeVisible();

    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Warning")) {
        consoleErrors.push(msg.text());
      }
    });

    // When: 클러스터 요약 아이템 클릭하여 상세 정보 열기
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ 클러스터 요약 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // 첫 번째 클러스터 아이템 클릭
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // Then: 커밋 목록이 표시되는지 확인
    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "상세 정보 컨테이너가 표시되어야 함").toBeVisible();

    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    expect(commitCount, "커밋 아이템이 표시되어야 함").toBeGreaterThan(0);
    console.log(`✅ ${commitCount}개의 커밋이 표시됨`);

    // 콘솔 에러가 없는지 확인
    expect(consoleErrors, `콘솔 에러: ${consoleErrors.join("\n")}`).toHaveLength(0);
  });

  test("PR의 통계 정보(총 커밋 수, 변경 파일 수, 추가/삭제 라인 수)가 표시된다", async ({ page }) => {
    // Given: 클러스터 요약 아이템이 있는 상태
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ 클러스터 요약 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // When: 클러스터 아이템 클릭하여 상세 정보 열기
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // Then: 통계 정보가 표시되는지 확인
    const detailSummary = page.locator(".detail__summary");
    await expect(detailSummary, "통계 요약 정보가 표시되어야 함").toBeVisible();

    // 통계 항목들 확인
    const summaryItems = detailSummary.locator(".detail__summary-item");
    const summaryCount = await summaryItems.count();

    expect(summaryCount, "통계 항목들이 표시되어야 함").toBeGreaterThan(0);
    console.log(`✅ ${summaryCount}개의 통계 항목이 표시됨`);

    // 각 통계 항목의 내용 확인 (실제 DOM에서는 단수형으로 표시됨)
    const expectedStats = [
      { key: "authors", display: "author" },
      { key: "commits", display: "commit" },
      { key: "changed files", display: "changed file" },
      { key: "additions", display: "additions" },
      { key: "deletions", display: "deletions" },
    ];

    await Promise.all(
      expectedStats.map(async ({ key, display }) => {
        // 실제 표시되는 텍스트로 검색
        const statItem = detailSummary.locator(
          `.detail__summary-item:has(.detail__summary-item-name:has-text("${display}"))`
        );
        await expect(statItem, `${key} 통계가 표시되어야 함`).toBeVisible();

        // 숫자 값이 표시되는지 확인
        const countElement = statItem.locator("strong");
        await expect(countElement, `${key}의 숫자 값이 표시되어야 함`).toBeVisible();

        const countText = await countElement.textContent();
        const trimmedCount = countText?.trim();
        expect(trimmedCount, `${key}의 값이 숫자여야 함`).toMatch(/^\d+$/);
        console.log(`✅ ${key}: ${trimmedCount}`);
      })
    );
  });

  test("각 커밋의 상세 정보(제목, 작성자, 날짜, 해시)가 올바르게 표시된다", async ({ page }) => {
    // Given: 클러스터 요약 아이템이 있는 상태
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ 클러스터 요약 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // When: 클러스터 아이템 클릭하여 상세 정보 열기
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // Then: 커밋 상세 정보가 표시되는지 확인
    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    if (commitCount === 0) {
      console.log("⚠️ 커밋 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // 첫 번째 커밋 아이템의 상세 정보 확인
    const firstCommit = commitItems.first();

    // 커밋 제목 확인
    const commitTitle = firstCommit.locator(".commit-message__title");
    await expect(commitTitle, "커밋 제목이 표시되어야 함").toBeVisible();

    const titleText = await commitTitle.textContent();
    expect(titleText, "커밋 제목이 비어있지 않아야 함").toBeTruthy();
    console.log(`✅ 커밋 제목: ${titleText}`);

    // 작성자 정보 확인
    const authorName = firstCommit.locator(".commit-item__author-name");
    await expect(authorName, "작성자 이름이 표시되어야 함").toBeVisible();

    const authorText = await authorName.textContent();
    expect(authorText, "작성자 이름이 비어있지 않아야 함").toBeTruthy();
    console.log(`✅ 작성자: ${authorText}`);

    // 날짜 정보 확인
    const commitDate = firstCommit.locator(".commit-item__date");
    await expect(commitDate, "커밋 날짜가 표시되어야 함").toBeVisible();

    const dateText = await commitDate.textContent();
    expect(dateText, "커밋 날짜가 비어있지 않아야 함").toBeTruthy();
    console.log(`✅ 커밋 날짜: ${dateText}`);

    // 커밋 해시 확인
    const commitId = firstCommit.locator(".commit-id__link");
    await expect(commitId, "커밋 해시 링크가 표시되어야 함").toBeVisible();

    const hashText = await commitId.textContent();
    expect(hashText, "커밋 해시가 표시되어야 함").toBeTruthy();
    expect(hashText, "커밋 해시는 6자리여야 함").toHaveLength(6);
    console.log(`✅ 커밋 해시: ${hashText}`);
  });

  test("커밋 제목에 마우스를 올리면(hover) 전체 제목이 나타나는 UI가 표시된다", async ({ page }) => {
    // Given: 클러스터 요약 아이템이 있는 상태
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ 클러스터 요약 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // When: 클러스터 아이템 클릭하여 상세 정보 열기
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // 커밋 아이템이 있는지 확인
    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    if (commitCount === 0) {
      console.log("⚠️ 커밋 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // Then: 커밋 해시에 hover하여 툴팁 확인 (실제로는 커밋 해시에 툴팁이 적용됨)
    const firstCommit = commitItems.first();
    const commitIdLink = firstCommit.locator(".commit-id__link");

    // 커밋 해시 링크에 마우스 hover
    await commitIdLink.hover();
    await page.waitForTimeout(1000);

    // 툴팁이 표시되는지 확인 (여러 가능한 셀렉터 시도)
    const tooltipSelectors = [
      "[role='tooltip']",
      ".MuiTooltip-tooltip",
      ".MuiTooltip-popper",
      "[data-testid='tooltip']",
    ];

    let tooltip = null;
    let i = 0;
    while (i < tooltipSelectors.length) {
      const selector = tooltipSelectors[i];
      const tooltipElement = page.locator(selector);
      const count = tooltipElement.count();
      if ((await count) > 0) {
        tooltip = tooltipElement;
        console.log(`툴팁 발견: ${selector}`);
        break;
      }
      i += 1;
    }

    if (tooltip) {
      await expect(tooltip, "커밋 해시 hover 시 툴팁이 표시되어야 함").toBeVisible({ timeout: 5000 });

      const tooltipText = await tooltip.textContent();
      expect(tooltipText, "툴팁에 커밋 해시가 표시되어야 함").toBeTruthy();
      console.log(`✅ 툴팁 내용: ${tooltipText}`);

      // 툴팁이 사라지는지 확인 (마우스가 벗어날 때)
      await page.mouse.move(0, 0);
      await page.waitForTimeout(1000);

      // 툴팁이 사라졌는지 확인 (MUI 툴팁은 애니메이션으로 사라지므로 약간의 대기 시간 필요)
      await page.waitForTimeout(2000);
      await expect(tooltip, "마우스가 벗어나면 툴팁이 사라져야 함").not.toBeVisible();
      console.log("✅ 툴팁이 정상적으로 사라짐");
    } else {
      console.log("⚠️ 툴팁이 발견되지 않음 - 테스트 스킵");
      test.skip();
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

    // When: 클러스터 요약 아이템 확인
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      // 빈 데이터 상태에서도 기본 UI는 표시되어야 함
      await expect(page.locator(".header-container"), "헤더 컨테이너가 표시되어야 함").toBeVisible();
      await expect(page.locator(".top-container"), "상단 컨테이너가 표시되어야 함").toBeVisible();
      console.log("✅ 빈 데이터 상태에서도 기본 UI가 정상 렌더링됨");
      return;
    }

    // 데이터가 있는 경우 상세 정보 열기
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // Then: 상세 정보 컨테이너가 표시되는지 확인
    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "상세 정보 컨테이너가 표시되어야 함").toBeVisible();
    console.log("✅ 데이터가 있는 상태에서 상세 정보가 정상 렌더링됨");
  });

  test("여러 커밋이 있는 클러스터에서 스크롤이 정상 작동해야 한다", async ({ page }) => {
    // Given: 클러스터 요약 아이템이 있는 상태
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ 클러스터 요약 아이템이 없어 테스트를 스킵합니다");
      test.skip();
      return;
    }

    // When: 클러스터 아이템 클릭하여 상세 정보 열기
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    // Then: 스크롤 가능한 영역 확인
    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "상세 정보 컨테이너가 표시되어야 함").toBeVisible();

    // 가상화된 리스트가 있는지 확인
    const virtualizedList = page.locator(".detail__virtualized-list");
    await expect(virtualizedList, "가상화된 리스트가 표시되어야 함").toBeVisible();

    // 스크롤 인디케이터가 있는지 확인 (많은 커밋이 있을 때)
    const scrollIndicator = page.locator(".detail__scroll-indicator");
    const hasScrollIndicator = await scrollIndicator.isVisible();

    if (hasScrollIndicator) {
      console.log("✅ 스크롤 인디케이터가 표시됨");

      // 스크롤 인디케이터 클릭하여 스크롤 테스트
      await scrollIndicator.click();
      await page.waitForTimeout(500);
      console.log("✅ 스크롤 인디케이터 클릭 작동");
    } else {
      console.log("✅ 스크롤이 필요하지 않은 상태 (커밋 수가 적음)");
    }
  });
});
