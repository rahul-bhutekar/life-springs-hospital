import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '../components/site/LegalPage';
import { HOSPITAL } from '../data/hospital';
import { LEGAL } from '../data/legal';

export function Privacy() {
  return (
    <LegalPage
      title="Privacy notice"
      intro={
        <>
          <p>
            This notice explains what personal data {HOSPITAL.name} collects through this website, why, who can see it,
            how long we keep it, and the rights you have under India's Digital Personal Data Protection Act, 2023.
          </p>
          <p>
            It covers this website only. Records created when you visit the hospital for care are handled under the
            hospital's medical records practices.
          </p>
        </>
      }
    >
      <LegalSection id="who" title="Who we are">
        <p>
          This website is run by {LEGAL.operator}, {HOSPITAL.addressLines.join(', ')}. We decide why and how your data
          from this website is used, so we are the "Data Fiduciary" under the Act.
        </p>
      </LegalSection>

      <LegalSection id="what" title="What we collect and why">
        <h3>When you request an appointment</h3>
        <p>We collect your name, mobile number, preferred date and time, and the reason for your visit.</p>
        <p>
          We use these only to call or WhatsApp you to arrange the appointment. We collect them after you tick the
          consent box on the form.
        </p>

        <h3>When you use the assistant</h3>
        <p>The assistant gives fixed answers approved by the hospital. We do not save your conversation. We save only:</p>
        <ul>
          <li>
            your name, mobile number, preferred date and reason, if you complete a booking or call-back request in the
            chat. The assistant asks for your consent before taking your number;
          </li>
          <li>
            the text of a question the assistant had no approved answer for, without your name or number, so our team
            can add better answers.
          </li>
        </ul>
        <p className="legal__note">
          Please don't type symptoms, test results or other health details into the assistant. For anything about your
          health, speak to our doctors. In an emergency, call the labour ward on {HOSPITAL.phoneDisplay}.
        </p>

        <h3>When you browse the website</h3>
        <p>
          We don't use analytics or advertising cookies, and we don't build profiles of visitors. Our hosting provider
          keeps standard server logs, such as IP address, browser type and pages requested, to run the site securely.
        </p>
      </LegalSection>

      <LegalSection id="consent" title="Your consent, and withdrawing it">
        <p>
          We rely on your consent to use the details you send us. You can withdraw it at any time by calling{' '}
          {HOSPITAL.phoneDisplay} or emailing {LEGAL.grievance.email}.
        </p>
        <p>
          We will then stop contacting you about that request and delete it, unless the law requires us to keep it.
          Withdrawing consent doesn't affect anything we did before you withdrew it.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Who can see your data">
        <ul>
          <li>
            <strong>Authorised hospital staff</strong>, through a passcode-protected admin page, to call you back.
          </li>
          <li>
            <strong>Google</strong>, which stores enquiries for us in Google Sheets and processes them only on our
            instructions. Google may store data on servers outside India.
          </li>
          <li>
            <strong>Vercel</strong>, which hosts this website.
          </li>
          <li>
            <strong>WhatsApp</strong>, if we message you there, under WhatsApp's own privacy policy.
          </li>
        </ul>
        <p>We don't sell your data or use it for marketing.</p>
      </LegalSection>

      <LegalSection id="third-party" title="Maps, fonts and links to other services">
        <p>
          The home page shows a Google Map, and the site loads its fonts from Google Fonts. Your browser connects to
          Google to show these, and Google may receive your IP address and set its own cookies under Google's privacy
          policy.
        </p>
        <p>Links to Google Maps and WhatsApp take you to those services, where their own policies apply.</p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep your data">
        <p>
          We delete appointment and call-back requests within {LEGAL.retention} of our last contact with you. We delete
          saved assistant questions within {LEGAL.retention}. We delete your request sooner if you ask us to, unless the
          law requires us to keep it.
        </p>
      </LegalSection>

      <LegalSection id="security" title="How we protect it">
        <p>
          Only authorised staff can open enquiries, using a passcode, and the stored data is kept private to the
          hospital's Google account. The website also limits automated and repeated submissions.
        </p>
        <p>
          No system is completely secure. If a breach affects your data, we will tell you and the Data Protection Board
          of India as the law requires.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
        <ul>
          <li>tell you what personal data we hold about you, how we use it and who we've shared it with;</li>
          <li>correct, complete or update it;</li>
          <li>delete it, unless the law requires us to keep it;</li>
          <li>record someone who can exercise these rights for you if you die or can't do so yourself.</li>
        </ul>
        <p>
          Contact our {LEGAL.grievance.title} using the details below. We will reply within {LEGAL.responseTime}. If
          you aren't satisfied with our answer, you can complain to the Data Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          A request about a baby or a child must be sent by their parent or legal guardian. We don't knowingly collect
          data from anyone under 18 without a parent's or guardian's consent.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact and complaints">
        <dl className="legal__contact">
          <dt>Contact</dt>
          <dd>{LEGAL.grievance.title}</dd>
          <dt>Email</dt>
          <dd>{LEGAL.grievance.email}</dd>
          <dt>Phone</dt>
          <dd>{LEGAL.grievance.phone}</dd>
          <dt>Post</dt>
          <dd>{HOSPITAL.addressLines.join(', ')}</dd>
        </dl>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this notice">
        <p>
          If we change how we use personal data, we will update this page and the date at the top. Also see our{' '}
          <Link to="/terms">Terms of use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
