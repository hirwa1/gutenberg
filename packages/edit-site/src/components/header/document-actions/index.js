/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalGetBlockLabel as getBlockLabel,
	getBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { last } from 'lodash';

function getBlockDisplayText( block ) {
	return block
		? getBlockLabel( getBlockType( block.name ), block.attributes )
		: null;
}

function useSecondaryText() {
	const {
		selectedBlock,
		getBlockParentsByBlockName,
		getBlockWithoutInnerBlocks,
		hoveredBlockIds,
		getBlockName,
		getBlock,
	} = useSelect( ( select ) => {
		const {
			getSelectedBlock,
			getHoveredBlocks,
			getBlockName: _getBlockName,
			getBlock: _getBlock,
		} = select( 'core/block-editor' );
		return {
			selectedBlock: getSelectedBlock(),
			getBlockParentsByBlockName: select( 'core/block-editor' )
				.getBlockParentsByBlockName,
			getBlockWithoutInnerBlocks: select( 'core/block-editor' )
				.__unstableGetBlockWithoutInnerBlocks,
			hoveredBlockIds: getHoveredBlocks(),
			getBlockName: _getBlockName,
			getBlock: _getBlock,
		};
	} );

	// Go through hovered blocks and see if one is of interest.
	const hoveredTemplatePartBlockId = hoveredBlockIds.find(
		( blockId ) => getBlockName( blockId ) === 'core/template-part'
	);
	if ( hoveredTemplatePartBlockId ) {
		const hoveredTemplatePartBlock = getBlock( hoveredTemplatePartBlockId );
		const hoveredLabel = hoveredTemplatePartBlock
			? getBlockLabel(
					getBlockType( hoveredTemplatePartBlock.name ),
					hoveredTemplatePartBlock.attributes
			  )
			: null;
		return {
			label: hoveredLabel,
			isActive: true,
		};
	}

	// Check if current block is a template part:
	const selectedBlockLabel =
		selectedBlock?.name === 'core/template-part'
			? getBlockDisplayText( selectedBlock )
			: null;

	if ( selectedBlockLabel ) {
		return {
			label: selectedBlockLabel,
			isActive: true,
		};
	}

	// Check if an ancestor of the current block is a template part:
	const templatePartParents = !! selectedBlock
		? getBlockParentsByBlockName(
				selectedBlock?.clientId,
				'core/template-part'
		  )
		: [];

	if ( templatePartParents.length ) {
		// templatePartParents is in order from top to bottom, so the closest
		// parent is at the end.
		const closestParent = getBlockWithoutInnerBlocks(
			last( templatePartParents )
		);
		return {
			label: getBlockDisplayText( closestParent ),
			isActive: true,
		};
	}

	return {};
}

export default function DocumentActions( { documentTitle } ) {
	const { label, isActive } = useSecondaryText();
	// Title is active when there is no secondary item, or when the secondary
	// item is inactive.
	const isTitleActive = ! label?.length || ! isActive;
	return (
		<div
			className={ classnames( 'edit-site-document-actions', {
				'has-secondary-label': !! label,
			} ) }
		>
			{ documentTitle ? (
				<>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__title',
							{
								'is-active': isTitleActive,
							}
						) }
					>
						{ documentTitle }
					</div>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__secondary-item',
							{
								'is-active': isActive,
							}
						) }
					>
						{ label ?? '' }
					</div>
				</>
			) : (
				__( 'Loading…' )
			) }
		</div>
	);
}
