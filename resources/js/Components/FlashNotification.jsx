import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function FlashNotification() {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: flash.success,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        customClass: {
          popup: 'rounded-xl border border-border shadow-lg',
        },
      });
    }

    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: flash.error,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        customClass: {
          popup: 'rounded-xl border border-border shadow-lg',
        },
      });
    }
  }, [flash?.success, flash?.error]);

  return null;
}
