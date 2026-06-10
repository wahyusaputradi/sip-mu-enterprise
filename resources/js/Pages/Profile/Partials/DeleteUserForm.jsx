import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <p className="text-sm text-slate-500 mb-6">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. 
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </header>

            <Button 
                variant="destructive" 
                onClick={confirmUserDeletion}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Hapus Akun Permanen
            </Button>

            <Dialog open={confirmingUserDeletion} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white rounded-[2rem] p-8 shadow-2xl">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-rose-600" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black text-slate-900">
                            Hapus Akun Permanen?
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2 text-slate-500">
                            Tindakan ini tidak bisa dibatalkan. Semua data profil dan pengaturan Anda akan hilang selamanya.
                            Silakan masukkan kata sandi Anda untuk mengonfirmasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={deleteUser} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="sr-only">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`h-11 bg-slate-50/50 border-slate-200 focus:ring-rose-500 focus:border-rose-500 rounded-xl transition-all ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="Masukkan kata sandi Anda"
                                isFocused={true}
                            />
                            {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium text-center">{errors.password}</p>}
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                className="w-full sm:w-1/2 rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-1/2 rounded-xl h-11 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Ya, Hapus Akun
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
