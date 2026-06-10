export default function ApplicationLogo({ className, ...props }) {
    // Otomatis mendeteksi base path agar logo muncul baik via XAMPP maupun artisan serve
    const isSubdirectory = window.location.pathname.startsWith('/sip-mu-enterprise');
    const logoPath = isSubdirectory 
        ? '/sip-mu-enterprise/public/images/logo.png' 
        : '/images/logo.png';

    return (
        <img 
            {...props} 
            src={logoPath} 
            alt="SIP MU Enterprise Logo" 
            className={`object-contain ${className}`}
        />
    );
}
