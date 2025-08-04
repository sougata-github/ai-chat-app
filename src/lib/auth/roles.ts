import type { SubArray } from 'better-auth/plugins/access'
import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access'

export type Role = keyof typeof allRoles

export type Permissions = {
	[k in keyof typeof statement]?: SubArray<(typeof statement)[k]>
}

export const statement = {
	task: ['create', 'read', 'update', 'delete'],
	patients: ['create', 'read', 'update', 'delete'],
	appointments: ['create', 'read', 'update', 'delete'],
	records: ['create', 'read', 'update', 'delete'],
	prescriptions: ['create', 'read', 'update', 'delete'],
	staff: ['create', 'read', 'update', 'delete'],
	payments: ['create', 'read', 'update', 'delete'],

	...defaultStatements,
} as const

export const ac = createAccessControl(statement)

const adminRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	patients: ['create', 'read', 'update', 'delete'],
	appointments: ['create', 'read', 'update', 'delete'],
	records: ['create', 'read', 'update', 'delete'],
	prescriptions: ['create', 'read', 'update', 'delete'],
	staff: ['create', 'read', 'update', 'delete'],
	payments: ['create', 'read', 'update', 'delete'],

	...adminAc.statements,
})

// const userRole = ac.newRole({
//   task: ['create', 'read', 'update', 'delete'],
//   ...userAc.statements,
// });
const doctorRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...userAc.statements,
	patients: ['read', 'update'], // Can view and update patient demographics
	appointments: ['read', 'update'], // Can view and update appointment details
	records: ['create', 'read', 'update'], // Can create, read, and update medical records
	prescriptions: ['create', 'read', 'update'], // Can create, read, and update prescriptions
	staff: ['read'], // Can view staff information (e.g., for collaboration)
	payments: ['read'], // Can view payment details (e.g., for billing inquiries)
})

// Staff Role (e.g., receptionist, nurse): Focus on administrative tasks and basic patient interaction
const staffRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...userAc.statements,
	patients: ['create', 'read', 'update'], // Can register new patients, view, and update patient info
	appointments: ['create', 'read', 'update'], // Can schedule, view, and update appointments
	records: ['read'], // Can view patient records (e.g., for administrative purposes)
	prescriptions: ['read'], // Can view prescriptions
	staff: ['read'], // Can view other staff information
	payments: ['create', 'read'], // Can record new payments and view payment history
})

// Patient Role: Access to their own data and services
const patientRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...userAc.statements,
	patients: ['read', 'update'], // Can read and update their own profile information
	appointments: ['create', 'read', 'update'], // Can create, read, and update their own appointments
	records: ['read'], // Can read their own medical records
	prescriptions: ['read'], // Can read their own prescriptions
	staff: [], // No access to staff management
	payments: ['create', 'read'], // Can make payments and view their own payment history
})
export const allRoles = {
	admin: adminRole,
	//user: userRole,
	doctor: doctorRole,
	staff: staffRole,
	patient: patientRole,
} as const

export const rolesData = Object.keys(allRoles) as Array<Role>

export type rolesEnumData = (typeof rolesData)[number]
