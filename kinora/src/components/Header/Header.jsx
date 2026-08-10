import Logo from "../common/Logo/Logo";
import Menu from "../Menu/Menu";
import Actions from "../Actions/Actions";
import "./Header.css";
const Header = () => {
  return (
    <header className="header">
      <Logo />
      <Menu />
      <Actions />
    </header>
  );
};
export default Header;
