import { Client } from '@notionhq/client';
import { TOKEN, DATABASE_ID } from '../config';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import ListItem from '../src/components/ListItem';
import { BankAccount } from '../types/Types';
import NumberWithComma from '../src/utils/Number';

const Home: NextPage = (data: any) => {
  const bankAccounts = data.bankAccounts;

  const sum = bankAccounts
    .map((account: any) => account.balance)
    .reduce((prev: number, curr: number) => prev + curr, 0);

  return (
    <div className={styles.container}>
      <Head>
        <title>가계부</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={sum > 0 ? styles.title_plus : styles.title_minus}>
          {NumberWithComma(sum)} 원
        </h1>
        <div className={styles.description}>2022-08-23(화)</div>
        <div className={styles.grid}>
          {bankAccounts.map((account: BankAccount) => (
            <ListItem key={account.id} data={account} />
          ))}
        </div>
      </main>

      <footer className={styles.footer}>Copyrightⓒ2022 poohoot. All rights reserved.</footer>
    </div>
  );
};

export default Home;

export async function getStaticProps() {
  const notion = new Client({ auth: TOKEN });

  const getDatabase = () => {
    return notion.databases.query({
      database_id: DATABASE_ID,
    });
  };

  const getPageTitle = (page: any) => {
    return notion.pages.properties.retrieve({
      page_id: page.id,
      property_id: page.properties.name.id,
    });
  };

  const getPageBalance = (page: any) => {
    return notion.pages.properties.retrieve({
      page_id: page.id,
      property_id: page.properties.balance.id,
    });
  };

  const getBankAccounts = async () => {
    const db = await getDatabase();
    return Promise.all(
      db.results.map(async (item) => {
        const titleData: any = await getPageTitle(item);
        const balanceData: any = await getPageBalance(item);

        let title: string = '';

        if (titleData.results[0]) {
          title = titleData.results[0].title.plain_text;
        }

        const account: BankAccount = {
          id: item.id,
          title: title,
          balance: balanceData.property_item.rollup.number,
        };

        return account;
      }),
    );
  };

  const bankAccounts = await getBankAccounts();
  bankAccounts.sort((prev: BankAccount, curr: BankAccount) => curr.balance - prev.balance);

  return {
    props: { bankAccounts },
  };
}
