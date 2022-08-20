import { Client } from '@notionhq/client';
import { TOKEN, DATABASE_ID } from '../config';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import ListItem from '../src/components/ListItem';
import { BankAccount } from '../types/Types';

const Home: NextPage = (data: any) => {
  const bankAccounts = data.bankAccounts;
  return (
    <div className={styles.container}>
      <Head>
        <title>가계부</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>계좌 잔액</h1>

        <p className={styles.description}>총 {bankAccounts.length}개</p>

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
      db.results.map(async (product) => {
        const title: any = await getPageTitle(product);
        const balance: any = await getPageBalance(product);

        const account: BankAccount = {
          id: product.id,
          title: title.results[0].title.plain_text,
          balance: balance.property_item.rollup.number,
        };

        return account;
      }),
    );
  };

  const bankAccounts = await getBankAccounts();

  return {
    props: { bankAccounts },
  };
}
