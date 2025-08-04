-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'NURSE', 'DOCTOR', 'LAB_TECHNICIAN', 'PATIENT', 'CASHIER');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'DORMANT');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FULL', 'PART');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'INSURANCE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."VaccineStatus" AS ENUM ('DUE', 'GIVEN', 'OVERDUE', 'EXPIRED', 'CATCH_UP');

-- CreateEnum
CREATE TYPE "public"."MilestoneCategory" AS ENUM ('GROSS_MOTOR', 'FINE_MOTOR', 'LANGUAGE', 'SOCIAL_EMOTIONAL', 'COGNITIVE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isAnonymous" BOOLEAN DEFAULT false,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "lastReset" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "patient_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL DEFAULT 'MALE',
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "parent_guardian_name" TEXT NOT NULL,
    "parent_guardian_phone" TEXT NOT NULL,
    "parent_guardian_email" TEXT,
    "relation_to_patient" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_number" TEXT NOT NULL,
    "relation_to_emergency" TEXT NOT NULL,
    "blood_group" TEXT,
    "allergies" TEXT,
    "medical_conditions" TEXT,
    "medical_history" TEXT,
    "insurance_provider" TEXT,
    "insurance_number" TEXT,
    "privacy_consent" BOOLEAN NOT NULL,
    "service_consent" BOOLEAN NOT NULL,
    "medical_consent" BOOLEAN NOT NULL,
    "img" TEXT,
    "color_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "public"."doctors" (
    "doctor_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "img" TEXT,
    "color_code" TEXT,
    "availability_status" TEXT,
    "job_type" "public"."JobType" NOT NULL DEFAULT 'FULL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "public"."working_days" (
    "working_day_id" SERIAL NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_days_pkey" PRIMARY KEY ("working_day_id")
);

-- CreateTable
CREATE TABLE "public"."staff" (
    "staff_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "img" TEXT,
    "license_number" TEXT,
    "color_code" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "appointment_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,
    "note" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "payment_id" SERIAL NOT NULL,
    "bill_id" INTEGER,
    "patient_id" TEXT NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "bill_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL DEFAULT 'CASH',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "receipt_number" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "public"."patient_bills" (
    "patient_bill_id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "service_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_bills_pkey" PRIMARY KEY ("patient_bill_id")
);

-- CreateTable
CREATE TABLE "public"."lab_tests" (
    "lab_test_id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "test_date" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "service_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("lab_test_id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "medical_record_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "treatment_plan" TEXT,
    "prescriptions" TEXT,
    "lab_request" TEXT,
    "notes" TEXT,
    "chief_complaint" TEXT,
    "hpi" TEXT,
    "ros" TEXT,
    "physical_exam" TEXT,
    "assessment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("medical_record_id")
);

-- CreateTable
CREATE TABLE "public"."vital_signs" (
    "vital_sign_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "body_temperature" DOUBLE PRECISION NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "heart_rate" DOUBLE PRECISION,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION,
    "head_circumference" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "nutritional_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("vital_sign_id")
);

-- CreateTable
CREATE TABLE "public"."diagnoses" (
    "diagnosis_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "diagnosis_name" TEXT NOT NULL,
    "notes" TEXT,
    "prescribed_medications" TEXT,
    "follow_up_plan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("diagnosis_id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "audit_log_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "model_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateTable
CREATE TABLE "public"."ratings" (
    "rating_id" SERIAL NOT NULL,
    "staff_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "service_id" SERIAL NOT NULL,
    "service_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "public"."growth_measurements" (
    "growth_measurement_id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "gender" "public"."Gender",
    "ageInDays" DOUBLE PRECISION,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION,
    "headCircumferenceCm" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "weightZScore" DOUBLE PRECISION,
    "heightZScore" DOUBLE PRECISION,
    "headCircumferenceZScore" DOUBLE PRECISION,
    "bmiZScore" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_measurements_pkey" PRIMARY KEY ("growth_measurement_id")
);

-- CreateTable
CREATE TABLE "public"."immunizations" (
    "immunization_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "dose_number" INTEGER NOT NULL,
    "administration_date" TIMESTAMP(3) NOT NULL,
    "next_dose_date" TIMESTAMP(3),
    "status" "public"."VaccineStatus" NOT NULL,
    "administered_by_doctor_id" TEXT,
    "batch_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immunizations_pkey" PRIMARY KEY ("immunization_id")
);

-- CreateTable
CREATE TABLE "public"."developmental_milestones" (
    "developmental_milestone_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "milestone_category" "public"."MilestoneCategory" NOT NULL,
    "milestone_description" TEXT NOT NULL,
    "achieved_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "assessed_by_doctor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developmental_milestones_pkey" PRIMARY KEY ("developmental_milestone_id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "content" TEXT,
    "parts" JSONB NOT NULL,
    "imageKey" TEXT,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "promptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stream" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_DoctorToRating" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DoctorToRating_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_DoctorToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DoctorToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "public"."Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "public"."Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_phone_key" ON "public"."patients"("patient_phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_email_key" ON "public"."patients"("patient_email");

-- CreateIndex
CREATE INDEX "patients_first_name_last_name_idx" ON "public"."patients"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "patients_parent_guardian_phone_idx" ON "public"."patients"("parent_guardian_phone");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "public"."doctors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_license_number_key" ON "public"."doctors"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_phone_key" ON "public"."doctors"("phone");

-- CreateIndex
CREATE INDEX "doctors_name_idx" ON "public"."doctors"("name");

-- CreateIndex
CREATE INDEX "working_days_day_start_time_idx" ON "public"."working_days"("day", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "working_days_doctor_id_day_key" ON "public"."working_days"("doctor_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "public"."staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "public"."staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "staff_license_number_key" ON "public"."staff"("license_number");

-- CreateIndex
CREATE INDEX "staff_name_idx" ON "public"."staff"("name");

-- CreateIndex
CREATE INDEX "appointments_patient_id_doctor_id_appointment_date_idx" ON "public"."appointments"("patient_id", "doctor_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_status_idx" ON "public"."appointments"("appointment_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointment_id_key" ON "public"."payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_number_key" ON "public"."payments"("receipt_number");

-- CreateIndex
CREATE INDEX "payments_patient_id_payment_date_idx" ON "public"."payments"("patient_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_status_payment_date_idx" ON "public"."payments"("status", "payment_date");

-- CreateIndex
CREATE INDEX "patient_bills_bill_id_service_id_idx" ON "public"."patient_bills"("bill_id", "service_id");

-- CreateIndex
CREATE INDEX "patient_bills_service_id_service_date_idx" ON "public"."patient_bills"("service_id", "service_date");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_service_id_key" ON "public"."lab_tests"("service_id");

-- CreateIndex
CREATE INDEX "lab_tests_medical_record_id_test_date_idx" ON "public"."lab_tests"("medical_record_id", "test_date");

-- CreateIndex
CREATE INDEX "lab_tests_test_date_status_idx" ON "public"."lab_tests"("test_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_appointment_id_key" ON "public"."medical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_created_at_idx" ON "public"."medical_records"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_created_at_idx" ON "public"."medical_records"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "vital_signs_medical_record_id_created_at_idx" ON "public"."vital_signs"("medical_record_id", "created_at");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_created_at_idx" ON "public"."vital_signs"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_medical_record_id_created_at_idx" ON "public"."diagnoses"("medical_record_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_patient_id_diagnosis_name_created_at_idx" ON "public"."diagnoses"("patient_id", "diagnosis_name", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_doctor_id_created_at_idx" ON "public"."diagnoses"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_action_model_name_created_at_idx" ON "public"."audit_logs"("user_id", "action", "model_name", "created_at");

-- CreateIndex
CREATE INDEX "ratings_staff_id_rating_idx" ON "public"."ratings"("staff_id", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_patient_id_staff_id_key" ON "public"."ratings"("patient_id", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_service_name_key" ON "public"."services"("service_name");

-- CreateIndex
CREATE INDEX "growth_measurements_patientId_measurementDate_gender_idx" ON "public"."growth_measurements"("patientId", "measurementDate", "gender");

-- CreateIndex
CREATE INDEX "immunizations_patient_id_vaccine_name_administration_date_idx" ON "public"."immunizations"("patient_id", "vaccine_name", "administration_date");

-- CreateIndex
CREATE INDEX "immunizations_status_next_dose_date_idx" ON "public"."immunizations"("status", "next_dose_date");

-- CreateIndex
CREATE INDEX "developmental_milestones_patient_id_milestone_category_achi_idx" ON "public"."developmental_milestones"("patient_id", "milestone_category", "achieved_date");

-- CreateIndex
CREATE INDEX "developmental_milestones_milestone_category_achieved_date_idx" ON "public"."developmental_milestones"("milestone_category", "achieved_date");

-- CreateIndex
CREATE UNIQUE INDEX "Message_promptId_key" ON "public"."Message"("promptId");

-- CreateIndex
CREATE INDEX "_DoctorToRating_B_index" ON "public"."_DoctorToRating"("B");

-- CreateIndex
CREATE INDEX "_DoctorToUser_B_index" ON "public"."_DoctorToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."working_days" ADD CONSTRAINT "working_days_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_bills" ADD CONSTRAINT "patient_bills_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_bills" ADD CONSTRAINT "patient_bills_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "public"."payments"("payment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnoses" ADD CONSTRAINT "diagnoses_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnoses" ADD CONSTRAINT "diagnoses_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."growth_measurements" ADD CONSTRAINT "growth_measurements_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."immunizations" ADD CONSTRAINT "immunizations_administered_by_doctor_id_fkey" FOREIGN KEY ("administered_by_doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."immunizations" ADD CONSTRAINT "immunizations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."developmental_milestones" ADD CONSTRAINT "developmental_milestones_assessed_by_doctor_id_fkey" FOREIGN KEY ("assessed_by_doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."developmental_milestones" ADD CONSTRAINT "developmental_milestones_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stream" ADD CONSTRAINT "Stream_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DoctorToRating" ADD CONSTRAINT "_DoctorToRating_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DoctorToRating" ADD CONSTRAINT "_DoctorToRating_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ratings"("rating_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DoctorToUser" ADD CONSTRAINT "_DoctorToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DoctorToUser" ADD CONSTRAINT "_DoctorToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
