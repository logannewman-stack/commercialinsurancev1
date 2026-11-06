import { useAnimatedNumber } from "../lib/useAnimatedNumber.js";
import { money } from "../lib/format.js";

export default function Money({ value, unit }) {
  const v = useAnimatedNumber(value);
  return <>{money(v)}{unit ? <small>{unit}</small> : null}</>;
}
