import { Client } from '@notionhq/client';
import { TOKEN, DATABASE_ID } from '../config';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

type ListItem = {
  id: string;
  text: string;
  value: number;
};

const Home: NextPage = (data: any) => {
  // console.log(data);

  return (
    <div className={styles.container}>
      <Head>
        <title>가계부</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>계좌 잔액</h1>

        <p className={styles.description}></p>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>이름&rarr;</h2>
            <p>9,999원</p>
          </a>
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

        const listItem: ListItem = {
          id: product.id,
          text: title.results[0].title.plain_text,
          value: balance.property_item.rollup.number,
        };

        return listItem;
      }),
    );
  };

  const bankAccounts = await getBankAccounts();

  return {
    props: { bankAccounts },
  };
}
