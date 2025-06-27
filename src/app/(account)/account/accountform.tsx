'use client'

import styles from './account.module.scss'
import { useState, useEffect } from 'react'
import { updateAccountInfo } from './actions'
import { toast } from 'react-hot-toast'
import { motion, Variants } from 'framer-motion'

type User = {
    name: string | null
    email: string
    username: string | null
    image: string | null
}

// Parent variant for stagger
const containerVariants: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.2,
        },
    },
}

// Child animation for form elements
const itemVariants: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
}

export default function AccountForm({ user }: { user: User }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState(user.name ?? '')
    const [username, setUsername] = useState(user.username ?? '')
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const changed =
            name.trim() !== (user.name ?? '').trim() ||
            username.trim() !== (user.username ?? '').trim()
        setHasChanges(changed)
    }, [name, username, user.name, user.username])

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            const result = await updateAccountInfo(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Account updated successfully!')
            }
        } catch (err) {
            console.error('Account update failed:', err)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            className={styles.formwraper}
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerdata}>
                    <h1 className={styles.title}>Account core</h1>
                </div>
            </div>

            {/* Form */}
            <form
                action={handleSubmit}
                className={styles.formlayout}
                autoComplete="off"
            >
                <motion.div className={styles.userInfo} variants={containerVariants}>
                    {/* Name */}
                    <motion.div className={styles.name} variants={itemVariants}>
                        <label className={styles.label}>
                            name*
                            <input
                                className={styles.input}
                                name="name"
                                defaultValue={user.name ?? ''}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                                aria-label="Name"
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </label>
                    </motion.div>

                    {/* Username */}
                    <motion.div className={styles.username} variants={itemVariants}>
                        <label className={styles.label}>
                            username*
                            <input
                                className={styles.input}
                                name="username"
                                defaultValue={user.username ?? ''}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={32}
                                pattern="^[a-zA-Z]*$"
                                aria-label="ontheorbit.com/username"
                                autoCorrect="off"
                                autoComplete="off"
                                style={{ textTransform: 'lowercase' }}
                            />
                        </label>
                    </motion.div>

                    {/* Email (read-only) */}
                    <motion.div className={styles.email} variants={itemVariants}>
                        <label className={styles.emaillabel}>
                            email (can't change)
                            <div
                                className={styles.emailinput}
                                style={{ textTransform: 'lowercase' }}
                            >
                                {user.email}
                            </div>
                        </label>
                    </motion.div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                    <button
                        className={styles.submitbtn}
                        type="submit"
                        disabled={isSubmitting || !hasChanges}
                    >
                        {isSubmitting ? 'Saving changes' : 'Save changes'}
                    </button>
                </motion.div>
            </form>
        </motion.div>
    )
}
