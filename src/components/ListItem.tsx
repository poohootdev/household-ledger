import { BankAccount } from '../../types/Types';
import NumberWithComma from '../../src/utils/Number';
import styles from '../../styles/Home.module.css';

const ListItem = ({ data }: { data: BankAccount }) => {
  const title = data.title;
  const balance = data.balance;

  return (
    <div className={styles.card}>
      <h2>
        {title} : {NumberWithComma(balance)} 원
      </h2>
    </div>
  );
};

export default ListItem;
