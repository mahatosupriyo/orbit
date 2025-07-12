import Icon from "@/components/atoms/icons"
import styles from "./legals.module.scss"
import Footer from "@/components/molecules/footer/footer"

export default function LegalPage() {
    const termsAndConditionsText = `For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean Edu Burner, whose registered/operational office is Kolkata, Newtown Newtown WEST BENGAL 700135 . "you", “your”, "user", “visitor” shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.

Your use of the website and/or purchase from us are governed by following Terms and Conditions:

The content of the pages of this website is subject to change without notice.

Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.

Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.

Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.

All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.

Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.

From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.

You may not create a link to our website from another website or document without Edu Burner’s prior written consent.

Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India .

We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time`

    const cancellationAndRefundText = `Edu Burner believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:

Cancellations will be considered only if the request is made within 30 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.

Edu Burner does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.

In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 30 days of receipt of the products.

In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 30 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.

In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.

In case of any Refunds approved by the Edu Burner, it’ll take 6-8 days for the refund to be processed to the end customer.`

    // Helper function to render text as paragraphs
    const renderParagraphs = (text: string) => {
        return text.split("\n\n").map((paragraph, index) => (
            <p key={index} className={styles.contenttxt}>
                {paragraph}
            </p>
        ))
    }

    return (
        <div className={styles.legalswraper}>
            <div className={styles.container}>
                <Icon name="oto" fill="#444" />
                <div className={styles.secwraper}>
                    <header className={styles.headercontainer}>
                        <h1 className={styles.header}>Legals</h1>
                        <p className={styles.updated}>Last updated on Jul 13 2025</p>
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
                </div>


            </div>
            <Footer />
        </div>
    )
}
