// * 추후 3가지 패키지(vscode&engine&view)에서 공통으로 쓰일 또다른 utils 패키지가 있어도 될 것 같습니다.

/**
 * 문자열에서 = 기호가 오는 패턴을 찾고, & 기호가 나오기 전까지의 모든 문자를 캡처합니다.
 * @example
 * const result = getPayloadParam('foo=bar&baz=qux', 'foo');
 * console.log(result); // 'bar'
 */
export const getPayloadParam = <T extends string = "">(text?: T, param = ""): string | null => {
  const regex = new RegExp(`${param}=([^&]*)`);
  const match = text?.match(regex);
  return match ? match[1] : null;
};
