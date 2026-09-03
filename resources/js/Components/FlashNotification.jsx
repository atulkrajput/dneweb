import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// sweetalert2 is large and only needed when a flash message is actually present.
// Import it dynamically so it stays out of the initial/shared bundle (reduces TBT).
const toast = async (options) => {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire({
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    customClass: {
      popup: 'rounded-xl border border-border shadow-lg',
    },
    ...options,
  });
};

export default function FlashNotification() {
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.success) {
      toast({ icon: 'success', title: 'Success', text: flash.success, timer: 3000 });
    }

    if (flash?.error) {
      toast({ icon: 'error', title: 'Error', text: flash.error, timer: 4000 });
    }
  }, [flash?.success, flash?.error]);

  return null;
}
