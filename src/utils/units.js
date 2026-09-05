// 물리 상수 및 공용 단위 헬퍼. DOM에 의존하지 않는다.

export const G0 = 9.80665; // 표준 중력가속도 (m/s^2)

export function sum(items, selector) {
  return items.reduce((acc, item) => acc + selector(item), 0);
}
