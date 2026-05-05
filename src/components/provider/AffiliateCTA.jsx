import Button from '../shared/Button'
import Icon from '../shared/Icon'
import AffiliateDisclosure from '../shared/AffiliateDisclosure'
import { openAffiliateLink } from '../../services/affiliate'

export default function AffiliateCTA({ provider, category }) {
  return (
    <div className="bg-primary-50 border border-primary-100 rounded-md p-6 text-center">
      <Button
        variant="primary"
        className="w-full justify-center text-base py-4"
        onClick={() => openAffiliateLink(provider, category.slug)}
      >
        Stap over via BespaarCheck
        <Icon name="arrow_forward" className="text-[18px]" />
      </Button>
      <AffiliateDisclosure />
    </div>
  )
}
