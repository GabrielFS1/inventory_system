import styles from './Header.module.scss'

export default function Header() {
  return (
    <div className={styles.navBar}>
      <p className={styles.logoText}>PJI</p>

      <div className={styles.buttonsNavBar}>
        <div>Cadastrar Usuário</div>
        <div>Cadastrar Item</div>
        <div>Importar Planilha</div>
      </div>
    </div>
  )
}