import { Phone, SearchScreen, QuestionScreen, ShoppingScreen, QuotesScreen, DoneScreen } from "./Phone.jsx";
import { Reveal, Words } from "./fx.jsx";

const SCREENS = [SearchScreen, QuestionScreen, ShoppingScreen, QuotesScreen, DoneScreen];

/* Five phones in a gentle arc: the whole flow, as it looks on mobile. */
export default function PhoneRow() {
  return (
    <section className="phones" aria-labelledby="phones-title">
      <div className="wrap">
        <div className="sec-head center">
          <Words as="h2" id="phones-title" className="mega-2" text="Works on your phone." tail="Start at your desk, finish on the job." />
        </div>
      </div>
      <div className="phone-row" role="img" aria-label="Keel on a phone: search, questions, carriers, quotes and confirmation screens">
        {SCREENS.map((S, i) => (
          <Reveal key={i} className={`pr-item pr-${i}`} delay={0.08 * Math.abs(2 - i)} y={40}>
            <Phone><S active /></Phone>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
