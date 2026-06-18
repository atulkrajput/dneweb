export default function ApplicationLogo({ className }) {
    return (
        <img
            src="/logo.png"
            alt="DNE Consultants"
            className={className || "h-16 w-auto"}
        />
    );
}
