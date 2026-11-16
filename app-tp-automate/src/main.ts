import './styles/tokens.css'
import './styles/base.css'
import './styles/composants.css'
import './styles/ecrans.css'
import './styles/responsive.css'
import './styles/automate.css'
import { monterApplication } from './ui/app'

const conteneur = document.querySelector<HTMLElement>('#app')
if (!conteneur) throw new Error('Le conteneur #app est introuvable.')
monterApplication(conteneur)
