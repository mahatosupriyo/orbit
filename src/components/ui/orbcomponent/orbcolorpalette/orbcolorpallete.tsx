"use client"
import OrbIcons from '../../atomorb/orbicons';
import styles from './orbcolorpallete.module.scss';

export default function OrbColorPalette() {
    return (
        <div className={styles.componentwraper}>
            <div className={styles.uploadbtnwraper}>
                <input type="file" className={styles.fileuploader} />
                <span className={styles.subwraper}>
                    <OrbIcons name='image' size={36} fill='#fff' />
                    {/* Image */}
                    {/* <div className={styles.keycombo}>
                    <span className={styles.key}>ctrl</span>
                    <span className={styles.key}>v</span>
                </div> */}

                </span>
                <h2 className={styles.mainlabel}>
                    Drag and Drop
                </h2>
            </div>
        </div>
    )
}