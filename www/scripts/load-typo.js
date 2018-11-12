/*
Copyright (c) 2011, Christopher Finke
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
		* Redistributions of source code must retain the above copyright
			notice, this list of conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright
			notice, this list of conditions and the following disclaimer in the
			documentation and/or other materials provided with the distribution.
		* The name of the author may not be used to endorse or promote products
			derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR FINKE BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// https://github.com/cfinke/Typo.js/pull/50 
"use strict";

// loadTypo returns a promise resolved when the given dictionaries are loaded
function loadTypo(affPath, dicPath) {
	return new Promise(function(resolve, reject) {
		var xhr_aff = new XMLHttpRequest();
		xhr_aff.open('GET', affPath, true);
		xhr_aff.onload = function() {
			if (xhr_aff.readyState === 4 && xhr_aff.status === 200) {
				//console.log('aff loaded');
				var xhr_dic = new XMLHttpRequest();
				xhr_dic.open('GET', dicPath, true);
				xhr_dic.onload = function() {
					if (xhr_dic.readyState === 4 && xhr_dic.status === 200) {
						//console.log('dic loaded');
						resolve(new Typo('en_US', xhr_aff.responseText, xhr_dic.responseText, { platform: 'any' }));
					} else {
						//console.log('failed loading dic');
						reject();
					}
				};
				//console.log('loading dic');
				xhr_dic.send(null);
			} else {
				//console.log('failed loading aff');
				reject();
			}
		};
		//console.log('loading aff');
		xhr_aff.send(null);
	});
}

