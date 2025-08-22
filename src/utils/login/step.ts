import { ParsedMembershipPackage } from '@hooks/usePackages'

export enum ESteps {
    Username = 0,
    Package = 1,
    Checkout = 2,
    Done = 3,
}

export type Choices = {
    [ESteps.Username]: string
    [ESteps.Package]: {
        package: ParsedMembershipPackage
        icpToPay: bigint
        acornToReceive: bigint
        coupon?: string | null
    } | null
    [ESteps.Checkout]: boolean
    [ESteps.Done]: boolean
}

export type StepProps = {
    choices: Choices
    setChoice: (choice: Choices[keyof Choices]) => void
    handlePrev: () => void
    handleNext: () => void
}
