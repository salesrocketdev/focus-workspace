import { PRODUCT_VERSION } from '@focora/core';
import { messages } from './messages';

export function App() {
  const copy = messages['pt-BR'];

  return (
    <main className="foundation">
      <section className="surface" aria-labelledby="title">
        <p className="eyebrow">{copy.status}</p>
        <h1 id="title">{copy.title}</h1>
        <p>{copy.description}</p>
        <small>{PRODUCT_VERSION}</small>
      </section>
    </main>
  );
}
