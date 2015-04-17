/**
 * Created by sergeant on 4/15/2015.
 */
'use strict';

import RiftMap from 'components/map/RiftMap.js';

describe('RiftMap api test', function () {

    it('should somewhat correctly calculate time dead', function () {
        expect(RiftMap.calculateTimeDead(1, 100)).toBe(7500);
        expect(RiftMap.calculateTimeDead(18, 2400000)).toBe(65000);
    });

});
