export type PublicUser = {
  id: string
  email: string
  fullName: string | null
  emailVerified: boolean
  isActive: boolean
  createdAt: string
}

export type AuthSessionResponseDto = {
  user: PublicUser
  accessToken: string
  expiresIn: number
  csrfToken: string
}
