import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '../components/site/LegalPage';
import { HOSPITAL } from '../data/hospital';
import { LEGAL } from '../data/legal';

export function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      intro={
        <p>
          These terms apply when you use the {HOSPITAL.name} website, including the appointment form and the assistant.
          By using the website you agree to them. They don't change any agreement you make with the hospital when you
          receive care.
        </p>
      }
    >
      <LegalSection id="not-advice" title="Not medical advice">
        <p>
          Information on this website, including the assistant's answers, is general information about our services.
          It isn't medical advice and doesn't replace a consultation with a doctor.
        </p>
        <p className="legal__note">
          In an emergency, such as pain, bleeding, fluid leaking or reduced baby movement, call our 24 × 7 labour ward
          on {HOSPITAL.phoneDisplay} or go to the nearest hospital straight away. Don't wait for a reply through the
          website.
        </p>
      </LegalSection>

      <LegalSection id="appointments" title="Appointment requests">
        <ul>
          <li>
            Sending a request through the form or the assistant does not book an appointment. It is confirmed only when
            our team calls or messages you.
          </li>
          <li>OPD timings and doctors' availability can change. We will tell you if your preferred time isn't possible.</li>
          <li>The website doesn't take payments.</li>
        </ul>
      </LegalSection>

      <LegalSection id="assistant" title="The assistant">
        <p>
          The assistant is an automated tool, not a person. It gives fixed answers approved by the hospital and may not
          cover your situation. Nobody watches the chat as it happens. If it can't answer, it offers a call back from
          our team.
        </p>
      </LegalSection>

      <LegalSection id="your-part" title="Using the website properly">
        <p>Please:</p>
        <ul>
          <li>give accurate details, and use only your own phone number or one you have permission to use;</li>
          <li>don't send spam or automated requests, or try to reach the staff-only admin pages;</li>
          <li>don't try to disrupt the website or get around its security.</li>
        </ul>
        <p>We may ignore or delete requests that break these terms.</p>
      </LegalSection>

      <LegalSection id="content" title="Accuracy and photos">
        <p>
          We try to keep the information on this website correct and up to date, but services, timings and facilities
          can change. Please confirm important details with us by phone.
        </p>
        <p>
          Some photos on this website are illustrative stock images. They don't show our premises, staff or patients.
        </p>
      </LegalSection>

      <LegalSection id="links" title="Other websites">
        <p>
          The website links to and shows content from other services, such as Google Maps and WhatsApp. We aren't
          responsible for those services, and their own terms apply.
        </p>
      </LegalSection>

      <LegalSection id="ownership" title="Ownership of content">
        <p>
          The text, design and logo of this website belong to {LEGAL.operator}. Stock photos are used under their
          licences. Please don't copy the website's content for commercial use without our permission.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Our responsibility">
        <p>
          We provide the website as it is and can't promise it will always be available or free of errors. As far as
          the law allows, we aren't responsible for loss caused by relying on the website instead of contacting us or a
          doctor. Nothing in these terms limits any responsibility that cannot be limited under Indian law.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Your personal data">
        <p>
          Our <Link to="/privacy">Privacy notice</Link> explains what we collect through the website and the rights you
          have.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Law and disputes">
        <p>These terms are governed by the laws of India. The courts in Pune have jurisdiction over any dispute.</p>
      </LegalSection>

      <LegalSection id="changes" title="Changes and contact">
        <p>
          We may update these terms. The date at the top shows when they last changed. Questions: call{' '}
          {HOSPITAL.phoneDisplay} or email {LEGAL.grievance.email}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
