import Icon from "@/components/atoms/icons";
import styles from "./legals.module.scss";
import Footer from "@/components/molecules/footer/footer";

export default function LegalPage() {
    const termsAndConditionsText = `For the purpose of these Terms and Conditions, the term "we", "us", "our" refers to On The Orbit, whose registered office is located in Newtown, Kolkata, West Bengal, 700135. "You", "your", "user", or "visitor" refers to any individual or entity visiting our website and/or agreeing to engage with us.

Your use of the website and/or interaction with our services is governed by the following Terms and Conditions:

The content of the pages of this website is subject to change without notice.

Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.

Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It is your own responsibility to ensure that any products, services, or information available through our website meet your specific requirements.

This website contains material which is owned by or licensed to us. This includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.

All trademarks reproduced on our website that are not the property of, or licensed to, the operator are acknowledged on the website.

Unauthorized use of any content or information provided by us may give rise to a claim for damages and/or be a criminal offense.

From time to time, our website may include links to other websites. These links are provided for your convenience to offer further information. They do not signify that we endorse the website(s), and we have no responsibility for the content of the linked website(s).

You may not create a link to our website from another website or document without On The Orbit’s prior written consent.

Any dispute arising from your use of our website or any engagement with us is subject to the laws of India.

We shall not be held liable for any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the cardholder having exceeded the preset limit mutually agreed with our acquiring bank.`;

    const cancellationAndRefundText = `On The Orbit believes in being fair and transparent with its users and has a liberal cancellation policy. Under this policy:

Cancellations will be considered only if the request is made within 30 days of placing the order. However, cancellation requests may not be accepted if the orders have already been processed, shipped, or fulfilled.

On The Orbit does not accept cancellation requests for digital goods once access or downloads have been granted. However, refunds may be considered if the product or service is not as described or is found to be defective.

If you receive a damaged or malfunctioning product (in case of any physical kits or items), please report it to our support team within 30 days of receipt. The issue will be investigated and resolved accordingly.

If you feel that the product or service received is not as shown on the site or does not meet your expectations, you must notify our customer service within 30 days. After reviewing your concern, we will determine the appropriate resolution.

For services or products with manufacturer warranties, please reach out to the respective provider directly.

In case a refund is approved by On The Orbit, the process may take 6–8 working days for the amount to be credited back to your original payment method.`;

    const privacyPolicyText = `On The Orbit ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you access our website and services, including through Google OAuth.

Information We Collect
When you sign in using Google OAuth, we may collect your name, email address, profile picture, and other data you explicitly authorize. We do not access your password. We also collect data you provide when using our platform, such as your posts, interactions, and preferences.

How We Use Your Data
We use your data to:
- Authenticate your identity
- Personalize your experience
- Provide educational services, community features, and relevant updates
- Improve and secure our platform

We do not sell your data or use it for third-party advertising.

Data Storage and Security
We store your data securely in encrypted databases and servers (hosted via AWS and related services). We use HTTPS, access controls, and secure storage to protect your information.

Data Sharing
We may share data only with:
- Third-party services necessary for providing our platform (e.g., cloud storage, analytics)
- Legal authorities, if required by law
- YouTube, Google Drive, or other APIs, only after your explicit OAuth permission

Your Rights
You may:
- Request deletion or correction of your data
- Disconnect your Google account
- Delete your On The Orbit account entirely

Cookies
We use cookies only for login sessions and platform performance. We do not use tracking cookies for ads.

Children’s Privacy
Our services are not directed at children under 13. We do not knowingly collect personal data from minors.

Google API Services Compliance
On The Orbit’s use of information from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Changes to This Policy
We may occasionally update this policy. You will be notified via email or on the website.

If you have questions, contact us at: support@ontheorbit.com`;

    const renderParagraphs = (text: string) => {
        return text.split("\n\n").map((paragraph, index) => (
            <p key={index} className={styles.contenttxt}>
                {paragraph}
            </p>
        ));
    };

    return (
        <div className={styles.legalswraper}>
            <div className={styles.container}>
                <Icon name="oto" size={40} fill="#444" />
                <div className={styles.secwraper}>
                    <header className={styles.headercontainer}>
                        <h1 className={styles.header}>Legals</h1>
                        <p className={styles.updated}>Last updated on Jul 23 2025</p>
                    </header>

                    <section className={styles.content}>
                        <h2 className={styles.contenthead}>Terms and Conditions</h2>
                        <p className={styles.contentupdate}>Last updated on Jul 13 2025</p>
                        <div className={styles.contenttxt}>{renderParagraphs(termsAndConditionsText)}</div>
                    </section>

                    <section className={styles.content}>
                        <h2 className={styles.contenthead}>Cancellation and Refund</h2>
                        <p className={styles.contentupdate}>Last updated on Jul 13 2025</p>
                        <div className={styles.contenttxt}>{renderParagraphs(cancellationAndRefundText)}</div>
                    </section>

                    <section className={styles.content}>
                        <h2 className={styles.contenthead}>Privacy Policy</h2>
                        <p className={styles.contentupdate}>Last updated on Jul 23 2025</p>
                        <div className={styles.contenttxt}>{renderParagraphs(privacyPolicyText)}</div>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}