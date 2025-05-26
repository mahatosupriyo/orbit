'use client'

import styles from './account.module.scss'
import { useState } from 'react'
import Button from '@/components/atoms/button/button'
import { updateAccountInfo } from './actions'
import { toast } from 'react-hot-toast'

type User = {
  name: string | null
  email: string
  username: string | null
  image: string | null
}

export default function AccountForm({ user }: { user: User }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateAccountInfo(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Account updated successfully!')
    }

    setIsSubmitting(false)
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerdata}>
          <h1 className={styles.title}>Account settings</h1>
        </div>
        <img
          src={user.image ?? '/default-avatar.png'}
          alt={user.name ?? 'User avatar'}
          className={styles.avatar}
          draggable="false"
        />
      </div>

      <form
        action={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          alignItems: 'flex-end',
        }}
      >
        <div className={styles.userInfo}>
          <div className={styles.name}>
            <p className={styles.label}>Name</p>
            <input
              className={styles.input}
              name="name"
              defaultValue={user.name ?? ''}
            />
          </div>

          <div className={styles.username}>
            <p className={styles.label}>Username</p>
            <input
              className={styles.input}
              name="username"
              defaultValue={user.username ?? ''}
            />
          </div>

          <div className={styles.email}>
            <p className={styles.label}>Email</p>
            <div
              className={styles.input}
              style={{ cursor: 'not-allowed' }}
            >
              {user.email}
            </div>
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving' : 'Save'}
          </Button>
        </div>
      </form>
    </>
  )
}
