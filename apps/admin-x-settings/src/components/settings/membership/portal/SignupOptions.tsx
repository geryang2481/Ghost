import CheckboxGroup from '../../../../admin-x-ds/global/form/CheckboxGroup';
import Form from '../../../../admin-x-ds/global/form/Form';
import React, {useContext} from 'react';
import Toggle from '../../../../admin-x-ds/global/form/Toggle';
import {CheckboxProps} from '../../../../admin-x-ds/global/form/Checkbox';
import {Setting, SettingValue, Tier} from '../../../../types/api';
import {SettingsContext} from '../../../providers/SettingsProvider';
import {checkStripeEnabled, getSettingValues} from '../../../../utils/helpers';

const SignupOptions: React.FC<{
    localSettings: Setting[]
    updateSetting: (key: string, setting: SettingValue) => void
    localTiers: Tier[]
    updateTier: (tier: Tier) => void
}> = ({localSettings, updateSetting, localTiers, updateTier}) => {
    const {config} = useContext(SettingsContext);

    const [membersSignupAccess, portalName, portalSignupCheckboxRequired, portalPlansJson] = getSettingValues(localSettings, ['members_signup_access', 'portal_name', 'portal_signup_checkbox_required', 'portal_plans']);
    const portalPlans = JSON.parse(portalPlansJson?.toString() || '[]') as string[];

    const togglePlan = (plan: string) => {
        const index = portalPlans.indexOf(plan);

        if (index === -1) {
            portalPlans.push(plan);
        } else {
            portalPlans.splice(index, 1);
        }

        updateSetting('portal_plans', JSON.stringify(portalPlans));
    };

    // This is a bit unclear in current admin, maybe we should add a message if the settings are disabled?
    const isDisabled = membersSignupAccess !== 'all';

    const isStripeEnabled = checkStripeEnabled(localSettings, config!);

    let tiersCheckboxes: CheckboxProps[] = [
        {
            checked: (portalPlans.includes('free')),
            disabled: isDisabled,
            label: 'Free',
            value: 'free',
            onChange: () => {
                togglePlan('free');
            }
        }
    ];

    if (isStripeEnabled) {
        localTiers.forEach((tier) => {
            tiersCheckboxes.push({
                checked: (tier.visibility === 'public'),
                label: tier.name,
                value: tier.id,
                onChange: (checked => updateTier({...tier, visibility: checked ? 'public' : 'none'}))
            });
        });
    }

    return <Form marginTop>
        <Toggle
            checked={Boolean(portalName)}
            disabled={isDisabled}
            label='Display name in signup form'
            labelStyle='heading'
            onChange={e => updateSetting('portal_name', e.target.checked)}
        />

        <CheckboxGroup
            checkboxes={tiersCheckboxes}
            title='Tiers available at startup'
        />

        {isStripeEnabled && localTiers.some(tier => tier.visibility === 'public') && (
            <CheckboxGroup
                checkboxes={[
                    {
                        checked: portalPlans.includes('monthly'),
                        disabled: isDisabled,
                        label: 'Monthly',
                        value: 'monthly',
                        onChange: () => {
                            togglePlan('monthly');
                        }
                    },
                    {
                        checked: portalPlans.includes('yearly'),
                        disabled: isDisabled,
                        label: 'Yearly',
                        value: 'yearly',
                        onChange: () => {
                            togglePlan('yearly');
                        }
                    }
                ]}
                title='Prices available at signup'
            />
        )}

        <div className='red text-sm'>TODO: Display notice at signup (Koenig)</div>

        <Toggle
            checked={Boolean(portalSignupCheckboxRequired)}
            disabled={isDisabled}
            label='Require agreement'
            labelStyle='heading'
            onChange={e => updateSetting('portal_signup_checkbox_required', e.target.checked)}
        />
    </Form>;
};

export default SignupOptions;