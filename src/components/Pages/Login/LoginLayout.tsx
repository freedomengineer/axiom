'use client'

import { Step, Stepper } from '@material-tailwind/react'
import { useState } from 'react'

import LoginStep2Icon from '@components/Assets/login_step2.svg'
import LoginStep3Icon from '@components/Assets/login_step3.svg'
import LoginStep4Icon from '@components/Assets/login_step4.svg'
import SchoolIcon from '@components/Assets/school.svg'
import cn from '@libs/class'
import { Choices, ESteps } from '@utils/login/step'

import CheckoutRegistration from './CheckoutRegistration'
import ChooseUsername from './ChooseUsername'
import Done from './Done'
import PurchasePackage from './PurchasePackage'

const STEPS = {
    [ESteps.Username]: {
        title: 'Choose a username',
        Icon: <SchoolIcon className="stroke-2 p-2 md:p-2.5" />,
        Component: ChooseUsername,
    },
    [ESteps.Package]: {
        title: 'Purchase a package',
        Icon: <LoginStep2Icon className="p-normal stroke-2" />,
        Component: PurchasePackage,
    },
    [ESteps.Checkout]: {
        title: 'Checkout your registration',
        Icon: <LoginStep3Icon className="p-normal stroke-2" />,
        Component: CheckoutRegistration,
    },
    [ESteps.Done]: {
        title: 'Welcome to Cypherspace',
        Icon: <LoginStep4Icon className="p-normal stroke-2" />,
        Component: Done,
    },
}

const LoginLayout = () => {
    const [step, setStep] = useState<ESteps>(ESteps.Username)
    const [choices, setChoices] = useState<Choices>({
        [ESteps.Username]: '',
        [ESteps.Package]: null,
        [ESteps.Checkout]: false,
        [ESteps.Done]: false,
    })

    const [isLastStep, setIsLastStep] = useState(false)
    const [isFirstStep, setIsFirstStep] = useState(false)

    const handleNext = () => !isLastStep && setStep((cur) => cur + 1)
    const handlePrev = () => !isFirstStep && setStep((cur) => cur - 1)

    const StepComponent = STEPS[step].Component

    return (
        <>
            <Stepper
                activeStep={step}
                isLastStep={(value) => setIsLastStep(value)}
                isFirstStep={(value) => setIsFirstStep(value)}
                activeLineClassName="bg-primary-800"
                className="mx-auto w-full md:w-[80%]"
            >
                {Object.entries(STEPS).map(([key, { title, Icon }], index) => (
                    <Step
                        key={key}
                        onClick={() =>
                            (index === ESteps.Done ? choices[ESteps.Checkout] : true) &&
                            setStep(index)
                        }
                        activeClassName="bg-primary-600 hover:pointer-events-none hover:bg-primary-600"
                        completedClassName="bg-primary-800 hover:cursor-pointer hover:bg-primary-600"
                        className={cn(
                            'h-8 w-8 bg-gray-300 hover:cursor-pointer hover:bg-gray-400 md:h-10 md:w-10',
                            !(index === ESteps.Done ? choices[ESteps.Checkout] : true) &&
                                'pointer-events-none hover:bg-gray-300'
                        )}
                    >
                        {Icon}
                        <p
                            className={cn(
                                'text-small absolute top-10 hidden text-nowrap text-center md:block',
                                step > index && 'font-medium text-primary-800',
                                step === index && 'font-medium text-primary-600',
                                step < index && 'font-light text-gray-800'
                            )}
                        >
                            {title}
                        </p>
                    </Step>
                ))}
            </Stepper>
            <div className="pt-normal gap-medium relative mx-auto flex w-full flex-col md:w-[80%] md:pt-[4rem]">
                <p className="text-normal pb-medium top-extralarge block text-center font-medium text-primary-600 md:hidden">
                    {STEPS[step].title}
                </p>
                <StepComponent
                    choices={choices}
                    setChoice={(choice) => setChoices((prev) => ({ ...prev, [step]: choice }))}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                />
            </div>
        </>
    )
}

export default LoginLayout
