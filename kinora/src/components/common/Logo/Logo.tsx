import logo from "../../../assets/images/kinora-logo.jpeg"
type LogoProps = {
    className?: string;
};

function Logo({ className = "" }: LogoProps) {
    return (
        <img
            src={logo}
            alt={"Kinora"}
            className={className}

        />
    )
}

export default Logo;