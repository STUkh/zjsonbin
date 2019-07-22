'use strict';
const syncHelper = require('../lib/zjson-bin.js');
const _ = require('lodash');

describe('Incrementals', function () {
    it('get simple obj property differences', function () {
        const originalObject = {
            id: 'obj1',
            name: 'Minolo',
            owner: {},
            status: null,
            settings: { param1: 'one', param2: 'two' },
            revision: 1
        };

        const updatedObject = {
            id: 'obj1',
            name: 'Maxolo',
            owner: {},
            status: null,
            description: null,
            settings: { param1: '1' },
            revision: 1
        };

        const change = syncHelper.differenceBetween(updatedObject, originalObject);

        console.info(JSON.stringify(change, null, 2));
        expect(change).toEqual(
            {
                name: 'Maxolo',
                settings: {
                    param1: '1',
                    param2: {
                        $removed: true
                    }
                }
            }
        );

        const obj = _.clone(originalObject);
        const syncedObj = syncHelper.mergeChanges(obj, change);
        // but syncedObj would not have comment since it was null
        delete updatedObject.description;
        expect(syncedObj).toEqual(updatedObject);
    });

    it('get simple obj array differences', function () {
        const originalObject = {
            name: 'Minolo',
            roles: [],
            tracks: [
                {
                    id: 1,
                    display: 'Requirement'
                },
                {
                    id: 2,
                    display: 'Implementation'
                }
            ],
            revision: 1
        };

        const updatedObject = {
            name: 'Minolo',
            roles: [],
            tracks: [
                {
                    id: 1,
                    display: 'Requirement Phase',
                    description: null
                }
            ],
            revision: 1
        };

        const change = syncHelper.differenceBetween(updatedObject, originalObject);

        console.info(JSON.stringify(change, null, 2));
        expect(change).toEqual(
            {
                tracks: [
                    {
                        id: 1,
                        display: 'Requirement Phase'
                    },
                    {
                        id: 2,
                        $removed: true
                    }
                ]
            }
        );

        const obj = _.clone(originalObject);
        const syncedObj = syncHelper.mergeChanges(obj, change);
        // but syncedObj would not have description since it was null
        delete updatedObject.tracks[0].description;
        expect(syncedObj).toEqual(updatedObject);
    });

    it('get deep array differences', function () {
        const originalObject = {
            name: 'Minolo',
            tracks: [
                {
                    id: 1,
                    display: 'Requirement',
                    resources: [
                        { id: 1, name: 'pedro' },
                        { id: 2, name: 'pablo' },
                        { id: 3, name: 'john' }
                    ]
                },
                {
                    id: 2,
                    display: 'Implementation',
                    resources: [
                        { id: 1, name: 'thomas' }
                    ]
                }
            ],
            revision: 1
        };

        const updatedObject = {
            name: 'Minolo',
            tracks: [
                {
                    id: 1,
                    display: 'Requirement',
                    resources: [
                        // peter is updated
                        { id: 1, name: 'peter' },
                        // pablo is removed
                        { id: 3, name: 'john' },
                        { id: 4, name: 'philip', comment: null }
                    ]
                },
                {
                    id: 2,
                    display: 'Implementation',
                    // all resources removed
                    resources: []
                }
            ],
            revision: 1
        };

        const change = syncHelper.differenceBetween(updatedObject, originalObject);

        console.info(JSON.stringify(change, null, 2));
        expect(change).toEqual(
            {
                tracks: [
                    {
                        id: 1,
                        resources: [
                            {
                                id: 1,
                                name: 'peter'
                            },
                            {
                                id: 4,
                                name: 'philip'
                            },
                            {
                                id: 2,
                                $removed: true
                            }
                        ]
                    },
                    {
                        id: 2,
                        resources: []
                    }
                ]
            }
        );
        const obj = _.clone(originalObject);
        const syncedObj = syncHelper.mergeChanges(obj, change);
        // but syncedObj would not have comment since it was null
        delete updatedObject.tracks[0].resources[2].comment;
        expect(syncedObj).toEqual(updatedObject);
    });
});