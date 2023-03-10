import styled from "styled-components";
import logo from "../imgs/logo-etherscan.svg";
import down from "../imgs/down.svg";
import user from "../imgs/user.svg";
import { useLocation, useNavigate } from "react-router";
const MainDropDownComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.pathname);
  const move = (path) => {
    navigate(path);
  };
  return (
    <Main top={location.pathname == "/" ? "2rem" : "3.3rem"}>
      <div>
        <Move
          onClick={() => {
            move("/");
          }}
        >
          <img src={logo} alt="" />
        </Move>
      </div>

      <Fbox>
        <div>
          <Move
            onClick={() => {
              move("/");
            }}
          >
            Home
          </Move>
        </div>
        <div>
          BlockChain <img src={down} alt="" srcset="" />
        </div>
        <div>
          Tokens
          <img src={down} alt="" srcset="" />
        </div>
        <div>
          NFTs
          <img src={down} alt="" srcset="" />
        </div>
        <div>
          Resources
          <img src={down} alt="" srcset="" />
        </div>
        <div>
          Developers
          <img src={down} alt="" srcset="" />
        </div>
        <div>
          More
          <img src={down} alt="" srcset="" />
        </div>
        <span>│</span>
        <div>
          <img src={user} alt="" srcset="" />
          Sign in
        </div>
      </Fbox>
    </Main>
  );
};
const Main = styled.div`
  // padding-top: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 7.5rem 0.5rem 5.5rem;
  padding-top: ${(probs) => {
    console.log(probs);
    return probs.top;
  }};
  > div > a > img {
    width: 10rem;
  }
  box-shadow: 0 10px 30px 0.1px rgba(0, 0, 0, 0.1);
`;

const Fbox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  gap: 1rem;
  > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  > span {
    margin: 0;
    padding: 0;
    gap: 0;
    opacity: 0.4;
  }

  > div > img {
    width: 1rem;
    margin-top: 0.2rem;
    margin-right: 0.5rem;
  }
  > div:nth-child(7) > img {
    margin-right: -0.5rem;
  }
`;

const Move = styled.a`
  text-decoration: none;
  color: inherit;
  cursor: pointer;
`;
export default MainDropDownComponent;
