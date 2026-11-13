import { useEffect, type ReactNode } from 'react';
import { HOSPITAL } from '../../data/hospital';
import { LEGAL } from '../../data/legal';
import { BackButton } from '../ui/BackButton';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import './LegalPage.css';

type Props = { title: string; intro: ReactNode; children: ReactNode };

/** Layout for the Privacy notice and Terms of use: readable single column with a contents list. */
export function LegalPage({ title, intro, children }: Props) {
  useEffect(() => {
    const before = document.title;
    document.title = `${title} · ${HOSPITAL.name}`;
    return () => {
      document.title = before;
    };
  }, [title]);

  return (
    <>
      <SiteHeader />
      <main className="legal container">
        <BackButton className="legal__back" label="Back" showLabel />
        <div className="eyebrow">Last updated {LEGAL.lastUpdated}</div>
        <h1 className="legal__title">{title}</h1>
        <div className="legal__intro">{intro}</div>
        <div className="legal__body">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

/** A numbered section with an anchor, so it can be linked to directly (e.g. /privacy#rights). */
export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="legal__section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}
