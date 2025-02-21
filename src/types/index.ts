import { FileWithPreview } from '@/components/DropZone'
import { z } from 'zod'

/** Auth & Users */
const authSchema = z.object({
    run: z.string(),
    name: z.string(),
    job_position: z.string().nullable(),
    email: z.string().email(),
    phone: z.string().nullable(),
    current_password: z.string(),
    password: z.string(),
    profile_image: z.string().nullable(),
    is_confirmed: z.boolean(),
    is_replacement: z.boolean(),
    password_confirmation: z.string(),
    token: z.string(),
    created_at: z.string(),
    updated_at: z.string()
})

type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>
export type UserRegistrationForm = Pick<Auth, 'run' | 'name' | 'email' | 'phone' | 'password' | 'password_confirmation'> & { profile_image?: FileWithPreview }
export type RequestConfirmationCodeForm = Pick<Auth, 'email'>
export type ForgotPasswordForm = Pick<Auth, 'email'>
export type NewPasswordForm = Pick<Auth, 'password' | 'password_confirmation'> & { current_password?: string }
export type UpdateCurrentUserPasswordForm = Pick<Auth, 'current_password' | 'password' | 'password_confirmation'>
export type ConfirmToken = Pick<Auth, 'token'>
export type CheckPasswordForm = Pick<Auth, 'password'>



export type User = z.infer<typeof userSchema>
export type UserProfileForm = Pick<User, 'name' | 'email'>


/** Roles */
export const roleSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
})

export type Role = z.infer<typeof roleSchema>
export type RoleForm = Pick<Role, 'name' | 'description'>
export type RoleUpdateForm = RoleForm & { id: number }


/** Users */
export const userSchema = authSchema.pick({
    name: true,
    job_position: true,
    email: true,
    phone: true,
    run: true,
    profile_image: true,
    is_confirmed: true,
    is_replacement: true,
    created_at: true,
    updated_at: true
}).extend({
    id: z.number(),
    roles: z.array(roleSchema.optional()).optional()
})

export type UserForm = Pick<User, 'name' | 'job_position' | 'email' | 'phone' | 'run' > & { roles: number[], profile_image?: FileWithPreview }
export type UserUpdateForm = UserForm & { id: number }


/** Categories */

export const categorySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
})

export type Category = z.infer<typeof categorySchema>
export type CategoryForm = Pick<Category, 'name' | 'description'>
export type CategoryUpdateForm = CategoryForm & { id: number }

/** Program_User */

export const programUserSchema = z.object({
    id: z.number(),
    program_id: z.number(),
    user_id: z.number(),
    turn: z.string().nullable(),
    is_coordinator: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    user: userSchema,
})

export type ProgramUser = z.infer<typeof programUserSchema>
export type ProgramUserForm = Pick<ProgramUser, 'program_id' | 'user_id' | 'turn'>
export type ProgramUserUpdateForm = ProgramUserForm & { id: number }

/** Programs */

export const programSchema = z.object({
    id: z.number(),
    name:      z.string(),
    company:  z.string(),
    address:   z.string(),
    state:     z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    users: z.array(programUserSchema).optional(),
})

export type Program = z.infer<typeof programSchema>
export type ProgramForm = Pick<Program, 'name' | 'company' | 'address' | 'state'>
export type ProgramUpdateForm = ProgramForm & { id: number }





/** Attachments */

export const attachmentSchema = z.object({
    id: z.number(),
    image: z.string(),
    created_at: z.string(),
    updated_at: z.string()
})

export type Attachment = z.infer<typeof attachmentSchema>
export type AttachmentForm = Pick<Attachment, 'image'>
export type AttachmentUpdateForm = AttachmentForm & { id: number }



/** Activities */
export const activitySchema: z.ZodSchema = z.object({
    id: z.number(),
    description: z.string(),
    date: z.string(),
    bitacora_id: z.number(),
    category_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    category: categorySchema,
    attachments: z.array(attachmentSchema).optional()
})

export type Activity = z.infer<typeof activitySchema>
export type ActivityForm = Pick<Activity, 'description' | 'date' | 'bitacora_id' | 'category_id'> & { attachments: FileWithPreview[] }
export type ActivityUpdateForm = ActivityForm & { id: number, newAttachments: FileWithPreview[], existingAttachments: Attachment[] }

/** Bitacoras */

export const bitacoraSchema = z.object({
    id: z.number(),
    month: z.string(),
    recipe: z.number().nullable(),
    status: z.string(),
    user_id: z.number(),
    program_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    user: userSchema,
    program: programSchema,
    activities: z.array(activitySchema).optional()
})

export type Bitacora = z.infer<typeof bitacoraSchema>
export type BitacoraForm = Pick<Bitacora, 'month' | 'recipe' | 'user_id' | 'program_id'>
export type BitacoraUpdateForm = BitacoraForm & { id: number }