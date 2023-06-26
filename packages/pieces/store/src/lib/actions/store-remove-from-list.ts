import { createAction, Property, StoreScope } from "@activepieces/pieces-framework";


export const storageRemoveFromList = createAction({
    action: {
        name: 'remove_from_list',
        displayName: 'Remove from List',
        description: 'Remove Item from a list',
        props: {
            key: Property.ShortText({
                displayName: 'Key',
                required: true
            }),
            value: Property.ShortText({
                displayName: 'Value',
                required: true
            }),
            store_scope: Property.StaticDropdown({
                displayName: 'Store Scope',
                description: 'The storage scope of the value.',
                required: true,
                options: {
                    options: [
                        {
                            label: "Project",
                            value: StoreScope.PROJECT
                        },
                        {
                            label: "Flow",
                            value: StoreScope.FLOW
                        }
                    ]
                },
                defaultValue: StoreScope.PROJECT
            })
        },
        async run(context) {
            const items = (await context.store.get<unknown[]>(context.propsValue['key'], context.propsValue.store_scope)) ?? [];
            if (!Array.isArray(items)) {
                throw new Error(`Key ${context.propsValue['key']} is not an array`);
            }
            if (items.includes(context.propsValue['value'])) {
                items.splice(items.indexOf(context.propsValue['value']), 1);
            }
            return await context.store.put(context.propsValue['key'], items, context.propsValue.store_scope);
        }
    }
});
