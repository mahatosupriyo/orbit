'use client'

import styles from './account.module.scss'
import { useState, useEffect } from 'react'
import { updateAccountInfo } from './actions'
import { toast } from 'react-hot-toast'

type User = {
    name: string | null
    email: string
    username: string | null
    image: string | null
}

/**
 * AccountForm component for updating user profile information.
 * - Tracks changes to name and username fields.
 * - Disables submit button if no changes or while submitting.
 * - Shows toast notifications for success or error.
 * - Prevents editing of email (display only).
 */
export default function AccountForm({ user }: { user: User }) {
    // Track submission state to prevent duplicate submissions
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Track input values for name and username
    const [name, setName] = useState(user.name ?? '')
    const [username, setUsername] = useState(user.username ?? '')
    // Track if any changes have been made to enable/disable the save button
    const [hasChanges, setHasChanges] = useState(false)

    // Effect to determine if form values have changed from initial user data
    useEffect(() => {
        const changed =
            name.trim() !== (user.name ?? '').trim() ||
            username.trim() !== (user.username ?? '').trim()
        setHasChanges(changed)
    }, [name, username, user.name, user.username])

    /**
     * Handles form submission.
     * Calls the server action to update account info and shows toast notifications.
     * @param formData FormData from the form submission
     */
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
            // Log error for debugging, but show generic error to user
            console.error('Account update failed:', err)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.formwraper}>
            {/* Header title */}
            <div className={styles.header}>
                <div className={styles.headerdata}>
                    <h1 className={styles.title}>Account settings</h1>
                </div>
            </div>

            {/* Account update form */}
            <form
                action={handleSubmit}
                className={styles.formlayout}
                autoComplete="off"
            >
                <div className={styles.userInfo}>
                    {/* Name input */}
                    <div className={styles.name}>
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
                                autoCorrect='off'
                            />
                        </label>

                    </div>

                    {/* Username input */}
                    <div className={styles.username}>
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
                                autoCorrect='off'
                                autoComplete="off"
                                style={{ textTransform: 'lowercase' }}
                            />
                        </label>
                    </div>

                </div>

                {/* Submit button, disabled if submitting or no changes */}
                <div>
                    <button className={styles.submitbtn} type="submit" disabled={isSubmitting || !hasChanges}>
                        {isSubmitting ? 'Saving changes' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}