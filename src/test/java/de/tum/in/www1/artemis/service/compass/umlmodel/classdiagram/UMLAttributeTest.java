package de.tum.in.www1.artemis.service.compass.umlmodel.classdiagram;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import me.xdrop.fuzzywuzzy.FuzzySearch;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import de.tum.in.www1.artemis.service.compass.utils.CompassConfiguration;

class UMLAttributeTest {

    private UMLAttribute attribute;

    @Mock
    UMLAttribute referenceAttribute;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);

        attribute = new UMLAttribute("myAttribute", "String", "attributeId");
    }

    @Test
    void similarity_nullReference() {
        double similarity = attribute.similarity(null);

        assertThat(similarity).isEqualTo(0);
    }

    @Test
    void similarity_differentElementType() {
        double similarity = attribute.similarity(mock(UMLMethod.class));

        assertThat(similarity).isEqualTo(0);
    }

    @Test
    void similarity_sameAttribute() {
        when(referenceAttribute.getName()).thenReturn("myAttribute");
        when(referenceAttribute.getAttributeType()).thenReturn("String");

        double similarity = attribute.similarity(referenceAttribute);

        assertThat(similarity).isEqualTo(1);
    }

    @Test
    void similarity_differentAttributeName() {
        when(referenceAttribute.getName()).thenReturn("differentAttr");
        when(referenceAttribute.getAttributeType()).thenReturn("String");
        double expectedNameSimilarity = FuzzySearch.ratio("myAttribute", "differentAttr") / 100.0 * CompassConfiguration.ATTRIBUTE_NAME_WEIGHT;
        double expectedTypeSimilarity = CompassConfiguration.ATTRIBUTE_TYPE_WEIGHT;

        double similarity = attribute.similarity(referenceAttribute);

        assertThat(similarity).isEqualTo(expectedNameSimilarity + expectedTypeSimilarity);
    }

    @Test
    void similarity_differentAttributeType() {
        when(referenceAttribute.getName()).thenReturn("myAttribute");
        when(referenceAttribute.getAttributeType()).thenReturn("int");
        double expectedNameSimilarity = CompassConfiguration.ATTRIBUTE_NAME_WEIGHT;
        double expectedTypeSimilarity = 0;

        double similarity = attribute.similarity(referenceAttribute);

        assertThat(similarity).isEqualTo(expectedNameSimilarity + expectedTypeSimilarity);
    }

    @Test
    void similarity_nullReferenceValues() {
        when(referenceAttribute.getName()).thenReturn(null);
        when(referenceAttribute.getAttributeType()).thenReturn(null);

        double similarity = attribute.similarity(referenceAttribute);

        assertThat(similarity).isEqualTo(0);
    }
}
