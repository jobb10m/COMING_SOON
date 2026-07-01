import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../api/axios';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalConditions: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass =
  'focus-ring w-full rounded-xl border border-border bg-base/40 px-4 py-2.5 text-sm placeholder:text-ink-muted';
const labelClass = 'mb-1.5 block text-sm font-medium text-ink-muted';

export default function MemberForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await api.post('/members', data);
      toast.success('Member added successfully');
      navigate('/members');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add member');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Add Member</h1>
        <p className="text-sm text-ink-muted">Create a new member profile and account.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass space-y-4 rounded-2xl p-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First name</label>
            <input {...register('firstName')} className={inputClass} placeholder="Sara" />
            {errors.firstName && <p className="mt-1 text-xs text-kinetic">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input {...register('lastName')} className={inputClass} placeholder="Bekele" />
            {errors.lastName && <p className="mt-1 text-xs text-kinetic">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email</label>
            <input {...register('email')} type="email" className={inputClass} placeholder="sara@example.com" />
            {errors.email && <p className="mt-1 text-xs text-kinetic">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Temporary password</label>
            <input {...register('password')} type="password" className={inputClass} placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-kinetic">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input {...register('phone')} className={inputClass} placeholder="+251 9xx xxx xxx" />
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input {...register('address')} className={inputClass} placeholder="Bole, Addis Ababa" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Emergency contact name</label>
            <input {...register('emergencyContact')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Emergency contact phone</label>
            <input {...register('emergencyPhone')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Medical conditions (optional)</label>
          <textarea {...register('medicalConditions')} rows={3} className={inputClass} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="focus-ring rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-base/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring rounded-xl bg-kinetic px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save member'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
