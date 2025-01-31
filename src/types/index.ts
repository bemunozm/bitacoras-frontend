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
    created_at: true,
    updated_at: true
}).extend({
    id: z.number(),
    roles: z.array(roleSchema.optional()).optional()
})

export type UserForm = Pick<User, 'name' | 'job_position' | 'email' | 'phone' | 'run' > & { roles: number[], profile_image?: FileWithPreview }
export type UserUpdateForm = UserForm & { id: number }


/** Residences */

export const residenceSchema = z.object({
    id: z.number(),
    name: z.string(),
    address: z.string(),
    capacity: z.number(),
    created_at: z.string(),
    updated_at: z.string()
})

export type Residence = z.infer<typeof residenceSchema>
export type ResidenceForm = Pick<Residence, 'name' | 'address' | 'capacity'>
export type ResidenceUpdateForm = ResidenceForm & { id: number }



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

/** Programs */

export const programSchema = z.object({
    id: z.number(),
    name:      z.string(),
    company:  z.string(),
    coordinator_id: z.number(),
    address:   z.string(),
    state:     z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    coordinator: userSchema,
    residences: z.array(residenceSchema).nullable()
})

export type Program = z.infer<typeof programSchema>
export type ProgramForm = Pick<Program, 'name' | 'company' | 'address' | 'state' | 'coordinator_id'> & { residences: number[] }
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
    categories: categorySchema,
    attachments: z.array(attachmentSchema).optional()
})

export type Activity = z.infer<typeof activitySchema>
export type ActivityForm = Pick<Activity, 'description' | 'date' | 'bitacora_id' | 'category_id'> & { attachments: FileWithPreview[] }
export type ActivityUpdateForm = ActivityForm & { id: number, newAttachments: FileWithPreview[], existingAttachments: Attachment[] }

/** Bitacoras */

export const bitacoraSchema = z.object({
    id: z.number(),
    month: z.string(),
    recipe: z.string(),
    status: z.string(),
    user_id: z.number(),
    program_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    users: userSchema,
    programs: programSchema,
    activities: z.array(activitySchema).optional()
})

export type Bitacora = z.infer<typeof bitacoraSchema>
export type BitacoraForm = Pick<Bitacora, 'month' | 'recipe' | 'user_id' | 'program_id'>
export type BitacoraUpdateForm = BitacoraForm & { id: number }


/** Diseases */
export const diseaseSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.string(),
    treatment_required: z.boolean(),
    contagious: z.boolean(),
    notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type Disease = z.infer<typeof diseaseSchema>
export type DiseaseForm = Pick<Disease, 'name' | 'description' | 'type' | 'treatment_required' | 'contagious' | 'notes'>
export type DiseaseUpdateForm = DiseaseForm & { id: number }

/** Events */
export const eventSchema = z.object({
    id: z.number(),
    date: z.string(),
    description: z.string(),
    type: z.string(),
    participant_id: z.number(),
    created_at: z.string(),
    updated_at: z.string()
})

export type Event = z.infer<typeof eventSchema>
export type EventForm = Pick<Event, 'date' | 'description' | 'type' | 'participant_id'>
export type EventUpdateForm = EventForm & { id: number }


/** Provision Categories */
export const provisionCategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
})

export type ProvisionCategory = z.infer<typeof provisionCategorySchema>
export type ProvisionCategoryForm = Pick<ProvisionCategory, 'name' | 'description'>
export type ProvisionCategoryUpdateForm = ProvisionCategoryForm & { id: number }

/** Provisions */
export const provisionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    provision_category_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    category: provisionCategorySchema.optional()
})

export type Provision = z.infer<typeof provisionSchema>
export type ProvisionForm = Pick<Provision, 'name' | 'description' | 'provision_category_id'>
export type ProvisionUpdateForm = ProvisionForm & { id: number }

/** Participants */

export const participantSchema = z.object({
    id: z.number(),
    name: z.string(),
    run: z.string(),
    gender: z.string().nullable(),
    birthdate: z.string().nullable(),
    nationality: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    residences: z.array(residenceSchema).optional(),
    diseases: z.array(diseaseSchema).optional(),
    provisions: z.array(provisionSchema).optional(),
    events: z.array(eventSchema).optional()
})

export type Participant = z.infer<typeof participantSchema>
export type ParticipantForm = Pick<Participant, 'name' | 'run' | 'birthdate' | 'nationality'>
export type ParticipantUpdateForm = ParticipantForm & { id: number }
