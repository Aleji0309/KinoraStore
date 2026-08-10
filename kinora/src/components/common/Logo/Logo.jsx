import logo from "../../../assets/images/kinora-logo.jpeg";
import "./logo.css";
const Logo = ({ className = "logo" }) => {
  return <img src={logo} alt="Kinora" className={className} />;
};
export default Logo;
