'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import styles from './subscribe.module.scss'

export default function SubscribeDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.dialog}>
                    <div className={styles.header}>
                        <Dialog.Title className={styles.title}>Subscribe to Unlock</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className={styles.closebtn} aria-label="Close">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className={styles.body}>
                        This content is available only for subscribers. Unlock all videos, resources and more.
                    </div>

                    <div className={styles.footer}>
                        <a href="/plans" className={styles.cta}>See Plans</a>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
